import DataStream from "./DataStream.js";
import VariableTable from "./VariableTable.js";

self.onmessage = (e) => {
    let blocks = JSON.parse(e.data).blocks;
    let inputs = JSON.parse(e.data).inputs;
    for (let i in blocks)
        blocks[i].forward = eval(blocks[i].forward);

    function calculateDataBlock(index) {
        console.log("Calculating " + index);
        let innerDataStream = [];
        let inputDataStream = [];
        if (blocks[index].type == "input") {
            let ds = new DataStream();
            ds.read(inputs[index]);
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

    let q = [];

    while (q.length > 0) {
        let currentIndex = q.shift();
    }

    console.log(calculateDataBlock(0).dataOutput[0]);

    postMessage({ type: "signal", data: "End" });
}