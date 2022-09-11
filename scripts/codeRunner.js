import CodeManager from "./codeManager.js";
import DataStream from "./DataStream.js";
import MemoryManager from "./MemoryManager.js";
import VariableTable from "./VariableTable.js";

let isCodeRunning = false;
let userStop = false;
let currentBlock = 0;
let inDegree = {};
let originalRegionDegrees = 0;
let regionFinished = {};
let regionCount = {};
let regions = {};
let regionsProjection = {};
let regionTree = {};
let ifRegions = {};
let ifRegionsCount = {};

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
        MemoryManager.instance.inputMemory[CodeManager.instance.graph.blocks[index].dataExports[i][0]][CodeManager.instance.graph.blocks[CodeManager.instance.graph.blocks[index].dataExports[i][0]].searchDataImport(index)] = res.dataOutput[i];
}

function restoreRegions(index) {
    let Rindex = index;
    console.log(Rindex);
    regionFinished[Rindex] = regionCount[Rindex];
    for (let i = 0; i < regionsProjection[Rindex].length; i++) {
        inDegree[regionsProjection[Rindex][i]] = 0;
        for (let j = 0; j < CodeManager.instance.graph.blocks[regionsProjection[Rindex][i]].logicImports.length; j++)
            inDegree[regionsProjection[Rindex][i]] += CodeManager.instance.graph.blocks[regionsProjection[Rindex][i]].logicImports[j].length;
    }
    if (CodeManager.instance.graph.blocks[Rindex].blockMould.type == "if")
        ifRegions[Rindex] = ifRegionsCount[Rindex];
    if (!regionTree[Rindex])
        return;
    for (let i = 0; i < regionTree[Rindex].length; i++)
        restoreRegions(regionTree[Rindex][i]);
}

async function forward(index) {
    currentBlock++;
    if (userStop) {
        currentBlock--;
        if (currentBlock == 0)
            codeRunFinished();
        return;
    }
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
    //console.log(index, res);
    MemoryManager.instance.outputMemory[index] = res;
    if (CodeManager.instance.graph.blocks[index].blockMould.type == "output") {
        let outputBlock = document.getElementById("out" + index);
        //console.log(MemoryManager.instance.inputMemory[index][0]);
        if (MemoryManager.instance.inputMemory[index][0].type == "string")
            outputBlock.innerText = "\"" + MemoryManager.instance.inputMemory[index][0].data + "\"";
        else if (MemoryManager.instance.inputMemory[index][0].type == "number")
            outputBlock.innerText = "" + MemoryManager.instance.inputMemory[index][0].data.toPrecision(6);
        else
            outputBlock.innerText = "" + MemoryManager.instance.inputMemory[index][0].data;
        //console.log(outputBlock.innerText);
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
        let block = CodeManager.instance.graph.blocks[regions[index]];
        if (block.blockMould.type == "if")
            ifRegions[regions[index]][block.searchLogicExport(index)]--;
        //console.log(block.blockMould.type, index, regions[index], regionFinished);
        if (block.blockMould.type == "while" && regionFinished[regions[index]] == 0) {
            originalRegionDegrees++;
            restoreRegions(regions[index]);
            //console.log(block.blockMould.type, index, regions[index], regionFinished);
            forward(regions[index]);
        } else if (block.blockMould.type == "if" && ifRegions[regions[index]][block.searchLogicExport(index)] == 0) {
            for (let i = 0; i < block.logicExports[2].length; i++) {
                inDegree[block.logicExports[2][i]]--;
                if (inDegree[block.logicExports[2][i]] == 0)
                    forward(block.logicExports[2][i]);
            }
        }
    }
    currentBlock--;
    if (userStop == true && currentBlock == 0)
        codeRunFinished();
};

function codeInitialize() {
    currentBlock = 0;
    inDegree = {};
    originalRegionDegrees = 0;
    regionFinished = {};
    regionCount = {};
    regions = {};
    regionsProjection = {};
    regionTree = {};
    ifRegions = {};
    ifRegionsCount = {};
    VariableTable.instance.clearVariableTable();
    MemoryManager.instance.clearOutputMemory();
    MemoryManager.instance.clearInputMemory();
    for (let i in CodeManager.instance.graph.blocks) {
        MemoryManager.instance.inputMemory[i] = [];
        MemoryManager.instance.outputMemory[i] = [];
        for (let j = 0; j < CodeManager.instance.graph.blocks[i].dataImports.length; j++)
            MemoryManager.instance.inputMemory[i].push(new DataStream());
        regions[i] = CodeManager.instance.graph.checkRegion(i);
        regionsProjection[i] = [];
        if (!regionsProjection[regions[i]])
            regionsProjection[regions[i]] = [];
        regionsProjection[regions[i]].push(i);
        if (CodeManager.instance.graph.blocks[i].blockMould.generalType == "logic") {
            if (!regionCount[regions[i]])
                regionCount[regions[i]] = 0;
            regionCount[regions[i]]++;
            if (regions[i] != -1 && CodeManager.instance.graph.blocks[regions[i]].blockMould.type == "if") {
                //console.log(regions[i], CodeManager.instance.graph.blocks, CodeManager.instance.graph.blocks[regions[i]].searchLogicExport(i))
                if (!ifRegionsCount[regions[i]])
                    ifRegionsCount[regions[i]] = [0, 0];
                ifRegionsCount[regions[i]][CodeManager.instance.graph.blocks[regions[i]].searchLogicExport(i)]++;
            }
            if (CodeManager.instance.graph.blocks[i].blockMould.type == "if" || CodeManager.instance.graph.blocks[i].blockMould.type == "while") {
                if (!regionTree[regions[i]])
                    regionTree[regions[i]] = [];
                regionTree[regions[i]].push(i);
            }
        }
        if (CodeManager.instance.graph.blocks[i].blockMould.type == "output")
            document.getElementById("out" + i).innerText = "";
        inDegree[i] = 0;
        for (let j = 0; j < CodeManager.instance.graph.blocks[i].logicImports.length; j++)
            inDegree[i] += CodeManager.instance.graph.blocks[i].logicImports[j].length;
    }
    console.log(regionTree);
    calcoriginalRegionDegrees();
    regionFinished = {...regionCount };
    ifRegions = {...ifRegionsCount };
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