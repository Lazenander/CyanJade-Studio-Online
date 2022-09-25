import DataStream from "./DataStream.js";
import VariableTable from "./VariableTable.js";

let constIndegree = {};
let constRegionCnt = {};
let regionTable = {},
    region2Table = {};
let regionTree = {};

let blocks, inputs;

function calculateDataBlock(index, variableTables = []) {
    console.log("Calculating" + index);
    let innerDataStream = [];
    let inputDataStream = [];
    if (blocks[index].type == "input") {
        let ds = new DataStream();
        ds.read(inputs[index][0]);
        innerDataStream.push(ds);
    } else {
        for (let i = 0; i < blocks[index].dataImports.length; i++) {
            if (blocks[index].dataImports[i] == -1) {
                inputDataStream.push(new DataStream());
                continue;
            }
            inputDataStream.push(calculateDataBlock(blocks[index].dataImports[i], variableTables).dataOutput[0]);
        }
    }
    let res = blocks[index].forward(innerDataStream, inputDataStream, variableTables);
    return res;
}

function forwardSwitch(index, variableTables = []) {
    let inputDataStream = [];
    for (let i = 0; i < blocks[index].dataImports.length; i++) {
        if (blocks[index].dataImports[i] == -1) {
            inputDataStream.push(new DataStream());
            continue;
        }
        inputDataStream.push(calculateDataBlock(blocks[index].dataImports[i], variableTables).dataOutput[0]);
    }
    let thisVariableTables = [...variableTables, new VariableTable()];
    let res = blocks[index].forward([], inputDataStream, thisVariableTables);
    forwardGraph([...blocks[index].logicExports[res.logicport]], thisVariableTables);
}

function forwardLoop(index, variableTables = []) {
    console.log("Running" + index);
    let inputDataStream = [];
    while (1) {
        inputDataStream = [];
        for (let i = 0; i < blocks[index].dataImports.length; i++) {
            if (blocks[index].dataImports[i] == -1) {
                inputDataStream.push(new DataStream());
                continue;
            }
            inputDataStream.push(calculateDataBlock(blocks[index].dataImports[i], variableTables).dataOutput[0]);
        }
        let thisVariableTables = [...variableTables, new VariableTable()];
        let res = blocks[index].forward([], inputDataStream, thisVariableTables);
        if (res.logicport == blocks[index].logicExports.length - 1)
            break;
        forwardGraph([...blocks[index].logicExports[res.logicport]], thisVariableTables);
    }
}

function forwardGraph(q, variableTables = []) {
    let calIndegree = {...constIndegree };

    while (q.length) {
        let currentIndex = q.shift();

        let innerDataStream = [],
            inputDataStream = [];
        try {
            switch (blocks[currentIndex].type) {
                case "output":
                    for (let i = 0; i < blocks[currentIndex].dataImports.length; i++) {
                        if (blocks[currentIndex].dataImports[i] == -1) {
                            inputDataStream.push(new DataStream());
                            continue;
                        }
                        inputDataStream.push(calculateDataBlock(blocks[currentIndex].dataImports[i], variableTables).dataOutput[0].readData(variableTables));
                    }
                    if (inputDataStream[0].type == "string")
                        postMessage({ type: "output", data: { index: currentIndex, context: "\"" + inputDataStream[0].data + "\"" } });
                    else if (inputDataStream[0].type == "number")
                        postMessage({ type: "output", data: { index: currentIndex, context: "" + Math.round(inputDataStream[0].data * 1e6) / 1e6 } });
                    else
                        postMessage({ type: "output", data: { index: currentIndex, context: "" + inputDataStream[0].data } });
                    break;
                case "switch":
                    forwardSwitch(currentIndex, variableTables);
                    for (let i = 0; i < blocks[currentIndex].logicExports[blocks[currentIndex].logicExports.length - 1].length; i++) {
                        calIndegree[blocks[currentIndex].logicExports[blocks[currentIndex].logicExports.length - 1][i]]--;
                        if (calIndegree[blocks[currentIndex].logicExports[blocks[currentIndex].logicExports.length - 1][i]] == 0)
                            q.push(blocks[currentIndex].logicExports[blocks[currentIndex].logicExports.length - 1][i]);
                    }
                    break;
                case "loop":
                    forwardLoop(currentIndex, variableTables);
                    for (let i = 0; i < blocks[currentIndex].logicExports[blocks[currentIndex].logicExports.length - 1].length; i++) {
                        calIndegree[blocks[currentIndex].logicExports[blocks[currentIndex].logicExports.length - 1][i]]--;
                        if (calIndegree[blocks[currentIndex].logicExports[blocks[currentIndex].logicExports.length - 1][i]] == 0)
                            q.push(blocks[currentIndex].logicExports[blocks[currentIndex].logicExports.length - 1][i]);
                    }
                    break;
                case "assign":
                    let ds = new DataStream();
                    ds.read(inputs[currentIndex][0]);
                    innerDataStream.push(ds);
                    for (let i = 0; i < blocks[currentIndex].dataImports.length; i++) {
                        if (blocks[currentIndex].dataImports[i] == -1) {
                            inputDataStream.push(new DataStream());
                            continue;
                        }
                        inputDataStream.push(calculateDataBlock(blocks[currentIndex].dataImports[i], variableTables).dataOutput[0]);
                    }
                    blocks[currentIndex].forward(innerDataStream, inputDataStream, variableTables);
                    for (let i = 0; i < blocks[currentIndex].logicExports.length; i++) {
                        for (let j = 0; j < blocks[currentIndex].logicExports[i].length; j++) {
                            calIndegree[blocks[currentIndex].logicExports[i][j]]--;

                            if (calIndegree[blocks[currentIndex].logicExports[i][j]] == 0)
                                q.push(blocks[currentIndex].logicExports[i][j]);
                        }
                    }
                    break;
                default:
                    for (let i = 0; i < blocks[currentIndex].dataImports.length; i++) {
                        if (blocks[currentIndex].dataImports[i] == -1) {
                            inputDataStream.push(new DataStream());
                            continue;
                        }
                        inputDataStream.push(calculateDataBlock(blocks[currentIndex].dataImports[i], variableTables).dataOutput[0]);
                    }
                    blocks[currentIndex].forward([], inputDataStream, variableTables);
                    for (let i = 0; i < blocks[currentIndex].logicExports.length; i++) {
                        for (let j = 0; j < blocks[currentIndex].logicExports[i].length; j++) {
                            calIndegree[blocks[currentIndex].logicExports[i][j]]--;

                            if (calIndegree[blocks[currentIndex].logicExports[i][j]] == 0)
                                q.push(blocks[currentIndex].logicExports[i][j]);
                        }
                    }
                    break;
            }
        } catch {
            postMessage({ type: "signal", data: "Error", index: currentIndex });
            close();
        }
    }
}

self.onmessage = (e) => {
    blocks = JSON.parse(e.data).blocks;
    inputs = JSON.parse(e.data).inputs;

    let q = [];

    for (let i in blocks) {
        blocks[i].forward = eval(blocks[i].forward);
        if (blocks[i].generalType == "data")
            continue;
        constIndegree[i] = 0;
        for (let j = 0; j < blocks[i].logicImports.length; j++)
            constIndegree[i] += blocks[i].logicImports[j].length;
    }

    let calIndegree = {...constIndegree };

    constRegionCnt[-1] = 0;

    for (let i in blocks) {
        if (constIndegree[i] == 0) {
            q.push(i);
            regionTable[i] = -1;
            constRegionCnt[-1]++;
        }
    }

    while (q.length > 0) {
        let currentIndex = q.shift();
        for (let i = 0; i < blocks[currentIndex].logicExports.length; i++) {
            for (let j = 0; j < blocks[currentIndex].logicExports[i].length; j++) {
                calIndegree[blocks[currentIndex].logicExports[i][j]] -= 1;

                if (calIndegree[blocks[currentIndex].logicExports[i][j]] == 0) {
                    q.push(blocks[currentIndex].logicExports[i][j]);

                    if (blocks[currentIndex].type == "switch" && i != 2) {
                        regionTable[blocks[currentIndex].logicExports[i][j]] = currentIndex + "_" + i;
                        if (!(currentIndex in region2Table))
                            region2Table[currentIndex] = [];
                        region2Table[currentIndex].push(blocks[currentIndex].logicExports[i][j]);
                        if (!(regionTable[currentIndex] in regionTree))
                            regionTree[regionTable[currentIndex]] = [];
                        regionTree[regionTable[currentIndex]].push(currentIndex + "_" + i);
                    } else if (blocks[currentIndex].type == "loop" && i != 1) {
                        regionTable[blocks[currentIndex].logicExports[i][j]] = currentIndex + "";
                        if (!(currentIndex in region2Table))
                            region2Table[currentIndex] = [];
                        region2Table[currentIndex].push(blocks[currentIndex].logicExports[i][j]);
                        if (!(regionTable[currentIndex] in regionTree))
                            regionTree[regionTable[currentIndex]] = [];
                        regionTree[regionTable[currentIndex]].push(currentIndex + "");
                    } else
                        regionTable[blocks[currentIndex].logicExports[i][j]] = regionTable[currentIndex];

                    if (regionTable[blocks[currentIndex].logicExports[i][j]] in constRegionCnt)
                        constRegionCnt[regionTable[blocks[currentIndex].logicExports[i][j]]]++;
                    else
                        constRegionCnt[regionTable[blocks[currentIndex].logicExports[i][j]]] = 1;
                }
            }
        }
    }

    for (let i in blocks)
        if (constIndegree[i] == 0)
            q.push(i);

    forwardGraph(q, [new VariableTable()]);

    postMessage({ type: "signal", data: "End" });
    close();
}