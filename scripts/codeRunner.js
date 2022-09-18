import DataStream from "./DataStream.js";
import VariableTable from "./VariableTable.js";

function calculateDataBlock(index) {
    console.log("Calculating " + index);
    let innerDataStream = [];
    let inputDataStream = [];
    if (blocks[index].type == "input") {
        let ds = new DataStream();
        ds.read(inputs[index][0]);
        console.log(ds);
        innerDataStream.push(ds);
    } else {
        for (let i = 0; i < blocks[index].dataImports.length; i++) {
            if (blocks[index].dataImports[i] == -1) {
                inputDataStream.push(new DataStream());
                continue;
            }
            inputDataStream.push(calculateDataBlock(blocks[index].dataImports[i]).dataOutput[0]);
        }
    }
    return blocks[index].forward(innerDataStream, inputDataStream);
}

let constIndegree = {};
let constRegionCnt = {};
let regionTable = {},
    region2Table = {};
let regionTree = {};

function initialize(q) {
    let calIndegree = {...constIndegree };

    while (q.length) {
        let currentIndex = q.shift();

        for (let i = 0; i < blocks[currentIndex].logicExports.length; i++) {
            for (let j = 0; j < blocks[currentIndex].logicImports[i].length; j++) {
                calIndegree[blocks[currentIndex].logicExports[i][j]]--;

                if (calIndegree[blocks[currentIndex].logicExports[i][j]] == 0)
                    q.push(blocks[currentIndex].logicExports[i][j]);
            }
        }
    }
}

function forwardGraph(q) {}

self.onmessage = (e) => {
    let blocks = JSON.parse(e.data).blocks;
    let inputs = JSON.parse(e.data).inputs;

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
        console.log(i, blocks);
        if (constIndegree[i] == 0) {
            q.push(i);
            regionTable[i] = -1;
            constRegionCnt[-1]++;
        }
    }

    while (q.length > 0) {
        let currentIndex = q.shift();
        console.log(currentIndex);
        for (let i = 0; i < blocks[currentIndex].logicExports.length; i++) {
            for (let j = 0; j < blocks[currentIndex].logicImports[i].length; j++) {
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

    console.log(constRegionCnt, regionTable, region2Table, regionTree);

    calIndegree = {...constIndegree };
    let calRegionCnt = {...constRegionCnt };

    for (let i in blocks)
        if (constIndegree[i] == 0)
            q.push(i);

    while (q.length > 0) {
        let currentIndex = q.shift();
        let innerDataStream = [],
            inputDataStream = [];
        let currentRegion = parseInt(regionTable[currentIndex])
        if (blocks[currentIndex] != "loop")
            calRegionCnt[currentRegion]--;
        if (blocks[currentIndex] == "assign") {
            let ds = new DataStream();
            ds.read(inputs[index]);
            innerDataStream.push(ds);
        }
        for (let i = 0; i < blocks[currentIndex].dataImports.length; i++)
            if (blocks[currentIndex].dataImports[i] != -1)
                inputDataStream.push(calculateDataBlock(blocks[currentIndex].dataImports[i]).dataOutput[0]);
        let res = blocks[currentIndex].forward(innerDataStream, inputDataStream);
        if (blocks[currentIndex] == "loop" && res.logicport == blocks[currentIndex].logicExports.length - 1)
            calRegionCnt[currentRegion]--;
        console.log(inputDataStream[0].data);
        if (blocks[currentIndex].type == "output") {
            if (inputDataStream[0].type == "string")
                postMessage({ type: "output", data: { index: currentIndex, context: "\"" + inputDataStream[0].data + "\"" } });
            else if (inputDataStream[0].type == "number")
                postMessage({ type: "output", data: { index: currentIndex, context: inputDataStream[0].data.toPrecision(6) } });
            else
                postMessage({ type: "output", data: { index: currentIndex, context: "" + inputDataStream[0].data } });
        }

        for (let i = 0; i < blocks[currentIndex].logicExports[res.logicport].length; i++)
            q.push(blocks[currentIndex].logicExports[res.logicport][0]);

        if (currentRegion != -1 && calRegionCnt[currentRegion] == 0) {
            if (blocks[currentRegion].type == "switch")
                for (let i = 0; i < blocks[currentRegion].logicExports[blocks[currentRegion].logicExports.length - 1].length; i++)
                    q.push(blocks[currentRegion].logicExports[blocks[currentRegion].logicExports.length - 1][i]);
            else if (blocks[currentRegion].type == "loop") {
                function clearRegion(index) {
                    calRegionCnt[index] = constRegionCnt[index];
                    for (let i = 0; i < region2Table[index].length; i++)
                        calIndegree[region2Table[index][i]] = constIndegree[region2Table[index][i]];
                    for (let i in regionTree[index])
                        clearRegion(regionTree[index][i]);
                }
                clearRegion(currentRegion);
                q.push(currentRegion);
            }
        }
    }

    postMessage({ type: "signal", data: "End" });
}