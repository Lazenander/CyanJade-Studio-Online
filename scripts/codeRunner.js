import CodeManager from "./codeManager.js";
import DataStream from "./DataStream.js";
import MemoryManager from "./MemoryManager.js";
import VariableTable from "./VariableTable.js";

let isCodeRunning = false;
let userStop = false;
let inDegree = {};
let originalRegionDegrees = 0;
let regionFinished = {};
let regionCount = {};
let regions = {};

const lockArea = document.getElementById('lockArea');
const img_runButton = document.getElementById('img_runButton');

function runCalculation(index) {
    console.log("Calculating " + index);
    let innerDataStream = [];
    if (CodeManager.instance.graph.blocks[index].blockMould.type == "input") {
        let block = document.getElementById("b" + index);
        let ds = new DataStream();
        ds.read(block.lastChild.firstChild.value);
        innerDataStream.push(ds);
    } else {
        for (let i = 0; i < CodeManager.instance.graph.blocks[index].dataImports.length; i++) {
            if (CodeManager.instance.graph.blocks[index].dataImports[i] == -1)
                continue;
            runCalculation(CodeManager.instance.graph.blocks[index].dataImports[i]);
        }
    }
    let res = CodeManager.instance.graph.blocks[index].blockMould.forward(innerDataStream, MemoryManager.instance.inputMemory[index]);
    MemoryManager.instance.outputMemory[index] = res;
    for (let i = 0; i < CodeManager.instance.graph.blocks[index].dataExports.length; i++)
        MemoryManager.instance.inputMemory[CodeManager.instance.graph.blocks[index].dataExports[i][0]].push(res);
}

async function forward(index) {
    console.log("Running " + index);
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
    let res = CodeManager.instance.graph.blocks[index].blockMould.forward(innerDataStream, MemoryManager.instance.inputMemory[index]);
    MemoryManager.instance.outputMemory[index] = res;
    if (CodeManager.instance.graph.blocks[index].blockMould.type == "output") {
        let outputBlock = document.getElementById("out" + index);
        if (MemoryManager.instance.inputMemory[index][0].dataOutput[0].type == "string")
            outputBlock.innerText = "\"" + MemoryManager.instance.inputMemory[index][0].dataOutput[0].data + "\"";
        else
            outputBlock.innerText = "" + MemoryManager.instance.inputMemory[index][0].dataOutput[0].data + "";
    }
    if (res.logicport != -1) {
        let flag = false;
        for (let i = 0; i < CodeManager.instance.graph.blocks[index].logicExports[res.logicport].length; i++) {
            inDegree[CodeManager.instance.graph.blocks[index].logicExports[res.logicport][i]]--;
            if (inDegree[CodeManager.instance.graph.blocks[index].logicExports[res.logicport][i]] == 0) {
                forward(CodeManager.instance.graph.blocks[index].logicExports[res.logicport][i]);
                flag = true;
            }
        }
        if (!flag && CodeManager.instance.graph.blocks[index].blockMould.type == "if") {
            for (let i = 0; i < CodeManager.instance.graph.blocks[index].logicExports[2].length; i++) {
                inDegree[CodeManager.instance.graph.blocks[index].logicExports[2][i]]--;
                if (inDegree[CodeManager.instance.graph.blocks[index].logicExports[2][i]] == 0)
                    forward(CodeManager.instance.graph.blocks[index].logicExports[2][i]);
            }
        }
    }
    if (regions[index] == -1) {
        originalRegionDegrees--;
        if (originalRegionDegrees == 0)
            codeRunFinished();
    } else {
        regionFinished[regions[index]]--;
        if (regionFinished[regions[index]] == 0) {
            let block = CodeManager.instance.graph.blocks[regions[index].split("_")[0]];
            if (block.blockMould.type == "while") {
                regionFinished[regions[index]] = regionCount[regions[index]];
                forward(regions[index].split("_")[0]);
            } else if (block.blockMould.type == "if") {
                for (let i = 0; i < block.logicExports[2].length; i++) {
                    inDegree[block.logicExports[2][i]]--;
                    if (inDegree[block.logicExports[2][i]] == 0)
                        forward(block.logicExports[2][i]);
                }
            }
        }
    }
};

function codeInitialize() {
    originalRegionDegrees = 0;
    regionFinished = {};
    regionCount = {};
    regions = {};
    VariableTable.instance.clearVariableTable();
    MemoryManager.instance.clearOutputMemory();
    MemoryManager.instance.clearInputMemory();
    for (let i in CodeManager.instance.graph.blocks) {
        MemoryManager.instance.inputMemory[i] = [];
        MemoryManager.instance.outputMemory[i] = [];
        regions[i] = CodeManager.instance.graph.checkRegion(i);
        if (CodeManager.instance.graph.blocks[i].blockMould.generalType == "logic") {
            if (!regionCount[regions[i]])
                regionCount[regions[i]] = 0;
            regionCount[regions[i]]++;
        }
        if (CodeManager.instance.graph.blocks[i].blockMould.type == "output")
            document.getElementById("out" + i).innerText = "";
        inDegree[i] = 0;
        for (let j = 0; j < CodeManager.instance.graph.blocks[i].logicImports.length; j++) {
            inDegree[i] += CodeManager.instance.graph.blocks[i].logicImports[j].length;
        }
    }
    calcoriginalRegionDegrees();
    regionFinished = {...regionCount };
}

function calcoriginalRegionDegrees() {
    originalRegionDegrees = 0;
    for (let i in CodeManager.instance.graph.blocks)
        if (CodeManager.instance.graph.blocks[i].blockMould.generalType == "logic" && regions[i] == -1)
            originalRegionDegrees++;
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
        let cinDegree = {...inDegree };
        for (let i in CodeManager.instance.graph.blocks) {
            if (CodeManager.instance.graph.blocks[i].blockMould.generalType == "data")
                continue;
            if (cinDegree[i] == 0 && regions[i] == -1) {
                forward(i);
            }
        }
        userStop = false;
    } else {
        userStop = true;
    }
}