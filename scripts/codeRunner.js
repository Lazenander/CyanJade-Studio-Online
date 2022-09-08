import CodeManager from "./codeManager.js";
import DataStream from "./DataStream.js";
import MemoryManager from "./MemoryManager.js";
import VariableTable from "./VariableTable.js";

let isCodeRunning = false;
let userStop = false;
let inDegree = {};
let OriginalRegionDegrees = 0;

const lockArea = document.getElementById('lockArea');
const img_runButton = document.getElementById('img_runButton');

function runCalculation(index) {
    let innerDataStream = [];
    if (CodeManager.instance.graph.blocks[index].blockMould.type == "input") {
        let block = document.getElementById("b" + index);
        let ds = new DataStream();
        ds.read(block.lastChild.firstChild.value);
        console.log(ds);
        innerDataStream.push(ds);
    } else {
        for (let i = 0; i < CodeManager.instance.graph.blocks[index].dataImports.length; i++) {
            if (CodeManager.instance.graph.blocks[index].dataImports[i] == -1)
                continue;
            runCalculation(CodeManager.instance.graph.blocks[index].dataImports[i]);
        }
    }
    console.log(index);
    let res = CodeManager.instance.graph.blocks[index].blockMould.forward(innerDataStream, MemoryManager.instance.inputMemory[index]);
    console.log(CodeManager.instance.graph.blocks[index].dataExports, MemoryManager.instance.inputMemory)
    MemoryManager.instance.outputMemory[index] = res;
    for (let i = 0; i < CodeManager.instance.graph.blocks[index].dataExports.length; i++)
        MemoryManager.instance.inputMemory[CodeManager.instance.graph.blocks[index].dataExports[i][0]].push(res);
}

async function forward(index) {
    let innerDataStream = [];
    if (CodeManager.instance.graph.blocks[index].blockMould.type == "assign") {
        let block = document.getElementById("b" + index);
        let ds = new DataStream();
        ds.read(block.lastChild.firstChild.value);
        innerDataStream.push(ds);
    }
    for (let i = 0; i < CodeManager.instance.graph.blocks[index].dataImports.length; i++) {
        if (CodeManager.instance.graph.blocks[index].dataImports[i] == -1)
            continue;
        runCalculation(CodeManager.instance.graph.blocks[index].dataImports[i]);
    }
    console.log(CodeManager.instance.graph.blocks[index].dataImports, MemoryManager.instance.inputMemory)
    let res = CodeManager.instance.graph.blocks[index].blockMould.forward(innerDataStream, MemoryManager.instance.inputMemory[index]);
    MemoryManager.instance.outputMemory[index] = res;
    if (CodeManager.instance.graph.blocks[index].blockMould.type == "output") {
        let outputBlock = document.getElementById("out" + index);
        console.log(MemoryManager.instance.inputMemory);
        if (MemoryManager.instance.inputMemory[index][0].dataOutput[0].type == "string")
            outputBlock.innerText = "\"" + MemoryManager.instance.inputMemory[index][0].dataOutput[0].data + "\"";
        else
            outputBlock.innerText = "" + MemoryManager.instance.inputMemory[index][0].dataOutput[0].data + "";
    }
    console.log(res);
    if (res.logicport != -1) {
        for (let i = 0; i < CodeManager.instance.graph.blocks[index].logicExports[res.logicport].length; i++) {
            console.log(CodeManager.instance.graph.blocks[index].logicExports[res.logicport][i], CodeManager.instance.graph.blocks[index].logicExports[res.logicport], index);
            inDegree[CodeManager.instance.graph.blocks[index].logicExports[res.logicport][i]]--;
            if (inDegree[CodeManager.instance.graph.blocks[index].logicExports[res.logicport][i]] == 0)
                forward(CodeManager.instance.graph.blocks[index].logicExports[res.logicport][i]);
        }
    }
    OriginalRegionDegrees--;
    if (OriginalRegionDegrees == 0)
        codeRunFinished();
};

function codeInitialize() {
    VariableTable.instance.clearVariableTable();
    MemoryManager.instance.clearOutputMemory();
    MemoryManager.instance.clearInputMemory();
    for (let i in CodeManager.instance.graph.blocks) {
        MemoryManager.instance.inputMemory[i] = [];
        MemoryManager.instance.outputMemory[i] = [];
        inDegree[i] = 0;
        for (let j = 0; j < CodeManager.instance.graph.blocks[i].logicImports.length; j++)
            inDegree[i] += CodeManager.instance.graph.blocks[i].logicImports[j].length;
    }
    calcOriginalRegionDegrees();
}

function calcOriginalRegionDegrees() {
    OriginalRegionDegrees = 0;
    for (let i in CodeManager.instance.graph.blocks)
        if (CodeManager.instance.graph.blocks[i].blockMould.generalType == "logic" && CodeManager.instance.graph.checkRegion(i) == -1)
            OriginalRegionDegrees++;
}

function codeRunFinished() {
    isCodeRunning = false;
    lockArea.classList.remove("display");
    lockArea.classList.add("notDisplay");
    img_runButton.setAttribute("src", "./res/svg/feather_cyan/play.svg");
    for (let i in CodeManager.instance.graph.blocks) {
        if (CodeManager.instance.graph.blocks[i].blockMould.type == "assign" ||
            CodeManager.instance.graph.blocks[i].blockMould.type == "input") {
            let block = document.getElementById("b" + i);
            block.lastChild.firstChild.classList.add("inputBorder");
            block.lastChild.firstChild.classList.remove("inputTransBorder");
        }
    }
}

window.runCode = (event) => {
    if (isCodeRunning == false) {
        isCodeRunning = true;
        lockArea.classList.remove("notDisplay");
        lockArea.classList.add("display");
        img_runButton.setAttribute("src", "./res/svg/feather_error/square.svg");
        for (let i in CodeManager.instance.graph.blocks) {
            if (CodeManager.instance.graph.blocks[i].blockMould.type == "assign" ||
                CodeManager.instance.graph.blocks[i].blockMould.type == "input") {
                let block = document.getElementById("b" + i);
                block.lastChild.firstChild.classList.remove("inputBorder");
                block.lastChild.firstChild.classList.add("inputTransBorder");
            }
        }
        codeInitialize();
        console.log(CodeManager.instance.graph.blocks);
        for (let i in CodeManager.instance.graph.blocks) {
            if (CodeManager.instance.graph.blocks[i].blockMould.generalType == "data")
                continue;
            if (inDegree[i] == 0) {
                console.log("Running" + i);
                forward(i).then(() => {
                    if (CodeManager.instance.graph.checkRegion(i) == -1)
                        OriginalRegionDegrees--;
                    if (OriginalRegionDegrees == 0)
                        codeRunFinished();
                })
            }
        }
        userStop = false;
    } else {
        userStop = true;
    }
}