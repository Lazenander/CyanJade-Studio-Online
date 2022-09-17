import DataStream from "./DataStream.js";
import VariableTable from "./VariableTable.js";

self.onmessage = (e) => {
    let blocks = JSON.parse(e.data).blocks;
    let inputs = JSON.parse(e.data).inputs;

    let constIndegree = {};
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
    let constRegionCnt = {};
    let regionTable = {};
    let regionTree = {};

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
            calIndegree[blocks[currentIndex].logicExports[i]] -= 1;

            if (calIndegree[blocks[currentIndex].logicExports[i]] == 0) {
                q.push(blocks[currentIndex].logicExports[i]);

                if (blocks[currentIndex].type == "switch" && i != 2) {
                    regionTable[blocks[currentIndex].logicExports[i]] = currentIndex + "_" + i;
                    if (!(regionTable[currentIndex] in regionTree))
                        regionTree[regionTable[currentIndex]] = [];
                    regionTree[regionTable[currentIndex]].push(currentIndex + "_" + i);
                } else if (blocks[currentIndex].type == "loop" && i != 1) {
                    regionTable[blocks[currentIndex].logicExports[i]] = currentIndex + "";
                    if (!(regionTable[currentIndex] in regionTree))
                        regionTree[regionTable[currentIndex]] = [];
                    regionTree[regionTable[currentIndex]].push(currentIndex + "");
                } else
                    regionTable[blocks[currentIndex].logicExports[i]] = regionTable[currentIndex];

                if (regionTable[blocks[currentIndex].logicExports[i]] in constRegionCnt)
                    constRegionCnt[regionTable[blocks[currentIndex].logicExports[i]]]++;
                else
                    constRegionCnt[regionTable[blocks[currentIndex].logicExports[i]]] = 1;
            }
        }
    }

    calIndegree = {...constIndegree };
    let calRegionCnt = {...constRegionCnt };

    for (let i in blocks)
        if (constIndegree[i] == 0)
            q.push(i);

    while (q.length > 0) {
        let currentIndex = q.shift();
        let innerDataStream = [],
            inputDataStream = [];
        if (blocks[currentIndex] != "loop")
            calRegionCnt[regionTable[currentIndex]]--;
        if (blocks[currentIndex] == "assign") {
            let ds = new DataStream();
            ds.read(inputs[index]);
            innerDataStream.push(ds);
        }
        for (let i = 0; i < blocks[currentIndex].dataImports.length; i++)
            inputDataStream.push(calculateDataBlock(blocks[currentIndex].dataImports[i]).dataOutput[0]);
        blocks[currentIndex].forward(innerDataStream, inputDataStream);
        console.log(inputDataStream[0].data);
        if (blocks[currentIndex].type == "output") {
            if (inputDataStream[0].type == "string")
                postMessage({ type: "output", data: { index: currentIndex, context: "\"" + inputDataStream[0].data + "\"" } });
            else if (inputDataStream[0].type == "number")
                postMessage({ type: "output", data: { index: currentIndex, context: inputDataStream[0].data.toPrecision(6) } });
            else
                postMessage({ type: "output", data: { index: currentIndex, context: "" + inputDataStream[0].data } });
        }
        /*
                if (calRegionCnt[regionTable[currentIndex]] == 0) {
                    if (blocks[regionTable[currentIndex]].type == "switch")
                        for (let i = 0; i < blocks[regionTable[currentIndex]].logicExports[blocks[regionTable[currentIndex]].logicExports.length - 1].length; i++)
                            q.push(blocks[regionTable[currentIndex]].logicExports[blocks[regionTable[currentIndex]].logicExports.length - 1][i]);
                    else if (blocks[regionTable[currentIndex]].type == "loop") {
                        q.push(regionTable[currentIndex]);
                    }
                }*/
    }

    console.log(calRegionCnt, regionTable);

    postMessage({ type: "signal", data: "End" });
}