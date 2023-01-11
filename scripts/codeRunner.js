import DataStream from "./DataStream.js";
import VariableTable from "./VariableTable.js";

let constIndegree = {};
let constRegionCnt = {};
let regionTable = {},
    region2Table = {};
let regionTree = {};

let blocks, globalInputs, Blibrary;

function calculateDataFunction(mouldInfo, inputDataStream, inputs = {}) {
    console.log(2);
    let innerVariableTable = new VariableTable();
    let graph = Blibrary[mouldInfo.lib].moulds[mouldInfo.nameID];
    console.log(mouldInfo.inputVariableNames, inputDataStream);
    for (let i in mouldInfo.inputVariableNames)
        innerVariableTable.assignVariable(new DataStream("variable", mouldInfo.inputVariableNames[i]), inputDataStream[i]);
    let thisVariableTables = [innerVariableTable];
    console.log(innerVariableTable);
    console.log(thisVariableTables[0]._storage);
    console.log(thisVariableTables);
    let q = [];
    let constFuncIndegree = {};
    let constFuncRegionCnt = {};
    let funcRegionTable = {},
        funcRegion2Table = {};
    let funcRegionTree = {};
    blocks = graph.blocks;

    for (let i in blocks) {
        if (blocks[i].generalType == "data")
            continue;
        constFuncIndegree[i] = 0;
        for (let j = 0; j < blocks[i].logicImports.length; j++)
            constFuncIndegree[i] += blocks[i].logicImports[j].length;
    }

    let calFuncIndegree = {...constFuncIndegree };

    constFuncRegionCnt[-1] = 0;

    for (let i in blocks) {
        if (constFuncIndegree[i] == 0) {
            q.push(i);
            funcRegionTable[i] = -1;
            constFuncRegionCnt[-1]++;
        }
    }

    while (q.length > 0) {
        let currentIndex = q.shift();
        for (let i = 0; i < blocks[currentIndex].logicExports.length; i++) {
            for (let j = 0; j < blocks[currentIndex].logicExports[i].length; j++) {
                calFuncIndegree[blocks[currentIndex].logicExports[i][j]] -= 1;

                if (calFuncIndegree[blocks[currentIndex].logicExports[i][j]] == 0) {
                    q.push(blocks[currentIndex].logicExports[i][j]);

                    if (blocks[currentIndex].type == "switch" && i != 2) {
                        funcRegionTable[blocks[currentIndex].logicExports[i][j]] = currentIndex + "_" + i;
                        if (!(currentIndex in funcRegion2Table))
                            funcRegion2Table[currentIndex] = [];
                        funcRegion2Table[currentIndex].push(blocks[currentIndex].logicExports[i][j]);
                        if (!(funcRegionTable[currentIndex] in funcRegionTree))
                            funcRegionTree[funcRegionTable[currentIndex]] = [];
                        funcRegionTree[funcRegionTable[currentIndex]].push(currentIndex + "_" + i);
                    } else if (blocks[currentIndex].type == "loop" && i != 1) {
                        funcRegionTable[blocks[currentIndex].logicExports[i][j]] = currentIndex + "";
                        if (!(currentIndex in funcRegion2Table))
                            funcRegion2Table[currentIndex] = [];
                        funcRegion2Table[currentIndex].push(blocks[currentIndex].logicExports[i][j]);
                        if (!(funcRegionTable[currentIndex] in funcRegionTree))
                            funcRegionTree[funcRegionTable[currentIndex]] = [];
                        funcRegionTree[funcRegionTable[currentIndex]].push(currentIndex + "");
                    } else
                        funcRegionTable[blocks[currentIndex].logicExports[i][j]] = funcRegionTable[currentIndex];

                    if (funcRegionTable[blocks[currentIndex].logicExports[i][j]] in constFuncRegionCnt)
                        constFuncRegionCnt[funcRegionTable[blocks[currentIndex].logicExports[i][j]]]++;
                    else
                        constFuncRegionCnt[funcRegionTable[blocks[currentIndex].logicExports[i][j]]] = 1;
                }
            }
        }
    }

    for (let i in blocks)
        if (constFuncIndegree[i] == 0)
            q.push(i);

    forwardGraph(q, graph.blocks, thisVariableTables, constFuncIndegree, globalInputs[mouldInfo.lib][mouldInfo.nameID]);

    let outputDataStream = [];
    console.log(mouldInfo.outputVariableNames);
    for (let i in mouldInfo.outputVariableNames)
        outputDataStream.push(innerVariableTable.readVariable(new DataStream("variable", mouldInfo.outputVariableNames[i])));

    console.log(outputDataStream[0]);

    return { logicport: -1, dataOutput: outputDataStream };
}

function calculateDataBlock(index, blocks, variableTables = [], inputs = {}) {
    let innerDataStream = [];
    let inputDataStream = [];
    let res = null;
    console.log(blocks);
    if (blocks[index].type == "input") {
        let ds = new DataStream();
        ds.read(inputs[index]);
        console.log("index", index, ds.data);
        innerDataStream.push(ds);
        res = blocks[index].forward(innerDataStream, inputDataStream, variableTables);
    } else if (blocks[index].type == "userDefData") {
        for (let i = 0; i < blocks[index].dataImports.length; i++) {
            if (blocks[index].dataImports[i] == -1) {
                inputDataStream.push(new DataStream());
                continue;
            }
            inputDataStream.push(calculateDataBlock(blocks[index].dataImports[i], blocks, variableTables, inputs).dataOutput[0]);
        }
        res = calculateDataFunction(Blibrary[blocks[index].lib].moulds[blocks[index].nameID], inputDataStream, inputs);
    } else {
        for (let i = 0; i < blocks[index].dataImports.length; i++) {
            if (blocks[index].dataImports[i] == -1) {
                inputDataStream.push(new DataStream());
                continue;
            }
            inputDataStream.push(calculateDataBlock(blocks[index].dataImports[i], blocks, variableTables, inputs).dataOutput[0]);
        }
        res = blocks[index].forward(innerDataStream, inputDataStream, variableTables);
    }
    console.log(index, res.dataOutput[0].type, res.dataOutput[0].data);
    return res;
}

function forwardSwitch(index, blocks, variableTables = [], indegree = constIndegree, inputs = {}) {
    let inputDataStream = [];
    for (let i = 0; i < blocks[index].dataImports.length; i++) {
        if (blocks[index].dataImports[i] == -1) {
            inputDataStream.push(new DataStream());
            continue;
        }
        inputDataStream.push(calculateDataBlock(blocks[index].dataImports[i], blocks, variableTables, inputs).dataOutput[0]);
    }
    let thisVariableTables = [...variableTables, new VariableTable()];
    let res = blocks[index].forward([], inputDataStream, thisVariableTables);
    forwardGraph([...blocks[index].logicExports[res.logicport]], blocks, thisVariableTables, indegree, inputs);
}

function forwardLoop(index, blocks, variableTables = [], indegree = constIndegree, inputs = {}) {
    let inputDataStream = [];
    while (1) {
        inputDataStream = [];
        for (let i = 0; i < blocks[index].dataImports.length; i++) {
            if (blocks[index].dataImports[i] == -1) {
                inputDataStream.push(new DataStream());
                continue;
            }
            inputDataStream.push(calculateDataBlock(blocks[index].dataImports[i], blocks, variableTables, inputs).dataOutput[0]);
        }
        let thisVariableTables = [...variableTables, new VariableTable()];
        let res = blocks[index].forward([], inputDataStream, thisVariableTables);
        if (res.logicport == blocks[index].logicExports.length - 1)
            break;
        forwardGraph([...blocks[index].logicExports[res.logicport]], blocks, thisVariableTables, indegree, inputs);
    }
}

function forwardGraph(q, blocks, variableTables = [], indegree = constIndegree, inputs = {}) {
    let calIndegree = {...indegree };

    console.log(q);

    while (q.length) {
        let currentIndex = q.shift();

        let innerDataStream = [],
            inputDataStream = [];
        console.log(blocks);
        console.log(currentIndex, blocks[currentIndex]);
        try {
            switch (blocks[currentIndex].type) {
                case "output":
                    for (let i = 0; i < blocks[currentIndex].dataImports.length; i++) {
                        if (blocks[currentIndex].dataImports[i] == -1) {
                            inputDataStream.push(new DataStream());
                            continue;
                        }
                        inputDataStream.push(calculateDataBlock(blocks[currentIndex].dataImports[i], blocks, variableTables, inputs).dataOutput[0].readData(variableTables));
                    }
                    postMessage({ type: "output", data: { index: currentIndex, context: inputDataStream[0].toString() } });
                    break;
                case "switch":
                    forwardSwitch(currentIndex, blocks, variableTables, indegree, inputs);
                    for (let i = 0; i < blocks[currentIndex].logicExports[blocks[currentIndex].logicExports.length - 1].length; i++) {
                        calIndegree[blocks[currentIndex].logicExports[blocks[currentIndex].logicExports.length - 1][i]]--;
                        if (calIndegree[blocks[currentIndex].logicExports[blocks[currentIndex].logicExports.length - 1][i]] == 0)
                            q.push(blocks[currentIndex].logicExports[blocks[currentIndex].logicExports.length - 1][i]);
                    }
                    break;
                case "loop":
                    forwardLoop(currentIndex, blocks, variableTables, indegree, inputs);
                    for (let i = 0; i < blocks[currentIndex].logicExports[blocks[currentIndex].logicExports.length - 1].length; i++) {
                        calIndegree[blocks[currentIndex].logicExports[blocks[currentIndex].logicExports.length - 1][i]]--;
                        if (calIndegree[blocks[currentIndex].logicExports[blocks[currentIndex].logicExports.length - 1][i]] == 0)
                            q.push(blocks[currentIndex].logicExports[blocks[currentIndex].logicExports.length - 1][i]);
                    }
                    break;
                case "assign":
                    let ds = new DataStream();
                    ds.read(inputs[currentIndex]);
                    innerDataStream.push(ds);
                    for (let i = 0; i < blocks[currentIndex].dataImports.length; i++) {
                        if (blocks[currentIndex].dataImports[i] == -1) {
                            inputDataStream.push(new DataStream());
                            continue;
                        }
                        inputDataStream.push(calculateDataBlock(blocks[currentIndex].dataImports[i], blocks, variableTables, inputs).dataOutput[0]);
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
                case "userDefLogic":
                    console.log(1);
                    for (let i = 0; i < blocks[currentIndex].dataImports.length; i++) {
                        if (blocks[currentIndex].dataImports[i] == -1) {
                            inputDataStream.push(new DataStream());
                            continue;
                        }
                        inputDataStream.push(calculateDataBlock(blocks[currentIndex].dataImports[i], blocks, variableTables, inputs).dataOutput[0]);
                    }
                    forwardFunction(Blibrary[blocks[currentIndex].lib].moulds[blocks[currentIndex].nameID], inputDataStream, variableTables);
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
                        inputDataStream.push(calculateDataBlock(blocks[currentIndex].dataImports[i], blocks, variableTables, inputs).dataOutput[0]);
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
        } catch (err) {
            console.error(err);
            postMessage({ type: "signal", data: "Error", index: currentIndex });
            close();
        }
    }
}

function forwardFunction(mouldInfo, inputDataStream, variableTables = [], inputs = {}) {
    console.log(2);
    let innerVariableTable = new VariableTable();
    let graph = Blibrary[mouldInfo.lib].moulds[mouldInfo.nameID];
    console.log(mouldInfo.inputVariableNames, inputDataStream);
    for (let i in mouldInfo.inputVariableNames)
        innerVariableTable.assignVariable(new DataStream("variable", mouldInfo.inputVariableNames[i]), inputDataStream[i]);
    let thisVariableTables = [...variableTables, innerVariableTable];
    console.log(innerVariableTable);
    console.log(thisVariableTables[0]._storage);
    console.log(thisVariableTables);
    let q = [];
    let constFuncIndegree = {};
    let constFuncRegionCnt = {};
    let funcRegionTable = {},
        funcRegion2Table = {};
    let funcRegionTree = {};
    blocks = graph.blocks;

    for (let i in blocks) {
        if (blocks[i].generalType == "data")
            continue;
        constFuncIndegree[i] = 0;
        for (let j = 0; j < blocks[i].logicImports.length; j++)
            constFuncIndegree[i] += blocks[i].logicImports[j].length;
    }

    let calFuncIndegree = {...constFuncIndegree };

    constFuncRegionCnt[-1] = 0;

    for (let i in blocks) {
        if (constFuncIndegree[i] == 0) {
            q.push(i);
            funcRegionTable[i] = -1;
            constFuncRegionCnt[-1]++;
        }
    }

    while (q.length > 0) {
        let currentIndex = q.shift();
        for (let i = 0; i < blocks[currentIndex].logicExports.length; i++) {
            for (let j = 0; j < blocks[currentIndex].logicExports[i].length; j++) {
                calFuncIndegree[blocks[currentIndex].logicExports[i][j]] -= 1;

                if (calFuncIndegree[blocks[currentIndex].logicExports[i][j]] == 0) {
                    q.push(blocks[currentIndex].logicExports[i][j]);

                    if (blocks[currentIndex].type == "switch" && i != 2) {
                        funcRegionTable[blocks[currentIndex].logicExports[i][j]] = currentIndex + "_" + i;
                        if (!(currentIndex in funcRegion2Table))
                            funcRegion2Table[currentIndex] = [];
                        funcRegion2Table[currentIndex].push(blocks[currentIndex].logicExports[i][j]);
                        if (!(funcRegionTable[currentIndex] in funcRegionTree))
                            funcRegionTree[funcRegionTable[currentIndex]] = [];
                        funcRegionTree[funcRegionTable[currentIndex]].push(currentIndex + "_" + i);
                    } else if (blocks[currentIndex].type == "loop" && i != 1) {
                        funcRegionTable[blocks[currentIndex].logicExports[i][j]] = currentIndex + "";
                        if (!(currentIndex in funcRegion2Table))
                            funcRegion2Table[currentIndex] = [];
                        funcRegion2Table[currentIndex].push(blocks[currentIndex].logicExports[i][j]);
                        if (!(funcRegionTable[currentIndex] in funcRegionTree))
                            funcRegionTree[funcRegionTable[currentIndex]] = [];
                        funcRegionTree[funcRegionTable[currentIndex]].push(currentIndex + "");
                    } else
                        funcRegionTable[blocks[currentIndex].logicExports[i][j]] = funcRegionTable[currentIndex];

                    if (funcRegionTable[blocks[currentIndex].logicExports[i][j]] in constFuncRegionCnt)
                        constFuncRegionCnt[funcRegionTable[blocks[currentIndex].logicExports[i][j]]]++;
                    else
                        constFuncRegionCnt[funcRegionTable[blocks[currentIndex].logicExports[i][j]]] = 1;
                }
            }
        }
    }

    for (let i in blocks)
        if (constFuncIndegree[i] == 0)
            q.push(i);

    forwardGraph(q, graph.blocks, thisVariableTables, constFuncIndegree, globalInputs[mouldInfo.lib][mouldInfo.nameID]);
}

self.onmessage = (e) => {
    blocks = JSON.parse(e.data).blocks;
    globalInputs = JSON.parse(e.data).inputs;
    Blibrary = JSON.parse(e.data).Blibrary;
    console.log(blocks[0])
    console.log(globalInputs);

    let q = [];

    for (let i in blocks) {
        blocks[i].forward = eval(blocks[i].forward);
        if (blocks[i].generalType == "data")
            continue;
        constIndegree[i] = 0;
        for (let j = 0; j < blocks[i].logicImports.length; j++)
            constIndegree[i] += blocks[i].logicImports[j].length;
    }

    for (let k in Blibrary)
        for (let i in Blibrary[k].moulds)
            for (let j in Blibrary[k].moulds[i].blocks)
                Blibrary[k].moulds[i].blocks[j].forward = eval(Blibrary[k].moulds[i].blocks[j].forward);

    console.log(Blibrary);

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

    console.log(q);

    forwardGraph(q, blocks, [new VariableTable()], constIndegree, globalInputs[0]);

    postMessage({ type: "signal", data: "End" });
    close();
}