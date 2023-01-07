import BlockLibraryManager from "./BlockLibraryManager.js";
import Block from "./Block.js";
import Graph from "./Graph.js";
import CodeManager from "./codeManager.js";
import DataStream from "./DataStream.js";
import FileOperator from "./FileOperator.js";
import LanguageManager from "./language.js";
import px2grid from "./projector.js";
import BlockLibrary from "./BlockLibrary.js";

const cssLink = document.getElementById("cssLink");
const sel_dark = document.getElementById("sel_dark");
const sel_light = document.getElementById("sel_light");
const opFileSelector = document.getElementById("opFileSelector");
const opBlockSelector = document.getElementById("opBlockSelector");
const opSettingSelector = document.getElementById("opSettingSelector");
const opBlockElementSelector = document.getElementById("opBlockElementSelector");
const dragDivArea = document.getElementById("dragDivArea");
const playgroundContainer = document.getElementById("playgroundContainer");
const canvasArea = document.getElementById("canvasArea");
const blockArea = document.getElementById("blockArea");
const shadowBlock = document.getElementById("shadowBlock");
const runButtonDiv = document.getElementById("runButtonDiv");
const img_runButton = document.getElementById("img_runButton");
const pstatus = document.getElementById("pstatus");
const pblocks = document.getElementById("pblocks");
const infoContainer = document.getElementById("infoContainer");
const fileNameInput = document.getElementById("fileNameInput");
const BLibMouldsContainer = document.getElementById("BLibMouldsContainer");
const mouldInfoContainer = document.getElementById("mouldInfoContainer");
const mouldName = document.getElementById("mouldName");
const mouldTypeData = document.getElementById("mouldTypeData");
const mouldTypeLogic = document.getElementById("mouldTypeLogic");
const mouldColor = document.getElementById("mouldColor");
const mouldHeight = document.getElementById("mouldHeight");
const mouldWidth = document.getElementById("mouldWidth");
const mouldInputs = document.getElementById("mouldInputs");
const mouldOutputs = document.getElementById("mouldOutputs");
const mouldOutputPort = document.getElementById("mouldOutputPort");
const mouldInfoSelectorOutputText = document.getElementById("mouldInfoSelectorOutputText");
const mouldInfoSelectorOutputInput = document.getElementById("mouldInfoSelectorOutputInput");

let activated = "disabled";
let blockLibDisplay = "disabled";
let currentTheme = "light";
let chosedBlockMould = null;
let chosedBlockIndex = null;
let shadowActivated = false;
let dragType = "";
let canvasSize = { width: Math.max(px2grid(window.screen.availWidth * 2), 500), height: Math.max(px2grid(window.screen.availHeight * 2), 500) };
let resX, resY;
let worker = undefined;
let port1 = {
    type: "none",
    blockIndex: -1,
    portIndex: -1
};
let isCodeRunning = false;
let navigatorType = 0;
let fileName = "Untitled";
let mouldNum = 1;
let thisLibrary = new BlockLibrary("Untitled", { "English": "Untitled", "Chinese": "未命名" }, "#2c9678");
let loadedLibraries = {};
let newLibMem = {};
let currentCodeGraph = 0;
let inputBuffer = { 0: {} };

function delBlockMouldBlocks(nameID) {
    if (currentCodeGraph == 0) {
        for (let index in CodeManager.instance.graph.blocks)
            if (CodeManager.instance.graph.blocks[index].blockMould.nameID == nameID) {
                let tmpblock = document.getElementById("b" + index);
                for (let i = 0; i < CodeManager.instance.graph.blocks[index].blockMould.logicImportNum; i++) {
                    for (let j = 0; j < CodeManager.instance.graph.blocks[index].logicImports[i].length; j++) {
                        let link = document.getElementById("l" + CodeManager.instance.graph.blocks[index].logicImports[i][j] +
                            "_" + CodeManager.instance.graph.blocks[CodeManager.instance.graph.blocks[index].logicImports[i][j]].searchLogicExport(index) +
                            "_" + index + "_" + i + "_" + "logic");
                        blockArea.removeChild(link);
                    }
                }
                for (let i = 0; i < CodeManager.instance.graph.blocks[index].blockMould.logicExportNum; i++) {
                    for (let j = 0; j < CodeManager.instance.graph.blocks[index].logicExports[i].length; j++) {
                        let link = document.getElementById("l" + index + "_" + i +
                            "_" + CodeManager.instance.graph.blocks[index].logicExports[i][j] +
                            "_" + CodeManager.instance.graph.blocks[CodeManager.instance.graph.blocks[index].logicExports[i][j]].searchLogicImport(index) +
                            "_" + "logic");
                        blockArea.removeChild(link);
                    }
                }
                for (let i = 0; i < CodeManager.instance.graph.blocks[index].blockMould.dataImportNum; i++) {
                    if (CodeManager.instance.graph.blocks[index].dataImports[i] == -1)
                        continue;
                    let link = document.getElementById("l" + CodeManager.instance.graph.blocks[index].dataImports[i] +
                        "_" + CodeManager.instance.graph.blocks[CodeManager.instance.graph.blocks[index].dataImports[i]].searchDataExport(index) +
                        "_" + index + "_" + i + "_" + "data");
                    blockArea.removeChild(link);
                }
                for (let i = 0; i < CodeManager.instance.graph.blocks[index].blockMould.dataExportNum; i++) {
                    for (let j = 0; j < CodeManager.instance.graph.blocks[index].dataExports[i].length; j++) {
                        let link = document.getElementById("l" + index + "_" + i +
                            "_" + CodeManager.instance.graph.blocks[index].dataExports[i][j] +
                            "_" + CodeManager.instance.graph.blocks[CodeManager.instance.graph.blocks[index].dataExports[i][j]].searchDataImport(index) +
                            "_" + "data");
                        blockArea.removeChild(link);
                    }
                }
                blockArea.removeChild(tmpblock);
                CodeManager.instance.delBlock(index);
                pblocks.innerText = CodeManager.instance.graph.size;
            }
        for (let j in thisLibrary.BlockMoulds) {
            for (let index in thisLibrary.BlockMoulds[j].codeManager.graph.blocks)
                if (thisLibrary.BlockMoulds[j].codeManager.graph.blocks[index].blockMould.nameID == nameID)
                    thisLibrary.BlockMoulds[j].codeManager.delBlock(index);
        }
    } else {
        for (let index in CodeManager.instance.graph.blocks)
            if (CodeManager.instance.graph.blocks[index].blockMould.nameID == nameID) {
                console.log(index, nameID);
                CodeManager.instance.delBlock(index);
            }
        for (let j in thisLibrary.BlockMoulds) {
            if (j == currentCodeGraph)
                continue;
            for (let index in thisLibrary.BlockMoulds[j].codeManager.graph.blocks)
                if (thisLibrary.BlockMoulds[j].codeManager.graph.blocks[index].blockMould.nameID == nameID)
                    thisLibrary.BlockMoulds[j].codeManager.delBlock(index);
        }
        for (let index in thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks)
            if (thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].blockMould.nameID == nameID) {
                let tmpblock = document.getElementById("b" + index);
                for (let i = 0; i < thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].blockMould.logicImportNum; i++) {
                    for (let j = 0; j < thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].logicImports[i].length; j++) {
                        let link = document.getElementById("l" + thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].logicImports[i][j] +
                            "_" + thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].logicImports[i][j]].searchLogicExport(index) +
                            "_" + index + "_" + i + "_" + "logic");
                        blockArea.removeChild(link);
                    }
                }
                for (let i = 0; i < thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].blockMould.logicExportNum; i++) {
                    for (let j = 0; j < thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].logicExports[i].length; j++) {
                        let link = document.getElementById("l" + index + "_" + i +
                            "_" + thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].logicExports[i][j] +
                            "_" + thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].logicExports[i][j]].searchLogicImport(index) +
                            "_" + "logic");
                        blockArea.removeChild(link);
                    }
                }
                for (let i = 0; i < thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].blockMould.dataImportNum; i++) {
                    if (thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].dataImports[i] == -1)
                        continue;
                    let link = document.getElementById("l" + thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].dataImports[i] +
                        "_" + thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].dataImports[i]].searchDataExport(index) +
                        "_" + index + "_" + i + "_" + "data");
                    blockArea.removeChild(link);
                }
                for (let i = 0; i < thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].blockMould.dataExportNum; i++) {
                    for (let j = 0; j < thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].dataExports[i].length; j++) {
                        let link = document.getElementById("l" + index + "_" + i +
                            "_" + thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].dataExports[i][j] +
                            "_" + thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].dataExports[i][j]].searchDataImport(index) +
                            "_" + "data");
                        blockArea.removeChild(link);
                    }
                }
                blockArea.removeChild(tmpblock);
                thisLibrary.BlockMoulds[currentCodeGraph].codeManager.delBlock(index);
                pblocks.innerText = thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.size;
            }

    }
}

window.onMouldNameChange = () => {
    for (let i in thisLibrary.BlockMoulds[currentCodeGraph].Tnames)
        thisLibrary.BlockMoulds[currentCodeGraph].Tnames[i] = mouldName.value;
    document.getElementById("userdefmould_" + currentCodeGraph).innerText = mouldName.value;
}

window.onMouldColorChange = () => {
    thisLibrary.color = mouldColor.value;
}

window.onMouldWidthChange = () => {
    delBlockMouldBlocks(currentCodeGraph);
    thisLibrary.BlockMoulds[currentCodeGraph].size.width = Math.max(parseInt(mouldWidth.value), 1);
    mouldWidth.value = thisLibrary.BlockMoulds[currentCodeGraph].size.width;
}

window.onMouldHeightChange = () => {
    delBlockMouldBlocks(currentCodeGraph);
    thisLibrary.BlockMoulds[currentCodeGraph].size.height = Math.max(parseInt(mouldHeight.value),
        thisLibrary.BlockMoulds[currentCodeGraph].logicImportNum + thisLibrary.BlockMoulds[currentCodeGraph].dataImportNum,
        thisLibrary.BlockMoulds[currentCodeGraph].logicExportNum + thisLibrary.BlockMoulds[currentCodeGraph].dataExportNum);
    mouldHeight.value = thisLibrary.BlockMoulds[currentCodeGraph].size.height;
}

window.changeMouldType = () => {
    delBlockMouldBlocks(currentCodeGraph);
    if (currentCodeGraph == 0)
        return;
    if (thisLibrary.BlockMoulds[currentCodeGraph].type == "userDefData") {
        thisLibrary.BlockMoulds[currentCodeGraph].type = "userDefLogic";
        thisLibrary.BlockMoulds[currentCodeGraph].generalType = "logic";
        thisLibrary.BlockMoulds[currentCodeGraph].logicImportNum = 1;
        thisLibrary.BlockMoulds[currentCodeGraph].logicExportNum = 1;
        thisLibrary.BlockMoulds[currentCodeGraph].dataImportNum = thisLibrary.BlockMoulds[currentCodeGraph].codeManager.inputVariableNames.length;
        thisLibrary.BlockMoulds[currentCodeGraph].dataExportNum = 0;
        mouldTypeData.classList.remove("display");
        mouldTypeData.classList.add("notDisplay");
        mouldTypeLogic.classList.remove("notDisplay");
        mouldTypeLogic.classList.add("display");
        mouldInfoSelectorOutputText.classList.remove("display");
        mouldInfoSelectorOutputText.classList.add("notDisplay");
        mouldInfoSelectorOutputInput.classList.remove("display");
        mouldInfoSelectorOutputInput.classList.add("notDisplay");
    } else {
        thisLibrary.BlockMoulds[currentCodeGraph].type = "userDefData";
        thisLibrary.BlockMoulds[currentCodeGraph].generalType = "data";
        thisLibrary.BlockMoulds[currentCodeGraph].logicImportNum = 0;
        thisLibrary.BlockMoulds[currentCodeGraph].logicExportNum = 0;
        thisLibrary.BlockMoulds[currentCodeGraph].dataImportNum = thisLibrary.BlockMoulds[currentCodeGraph].codeManager.inputVariableNames.length;
        thisLibrary.BlockMoulds[currentCodeGraph].dataExportNum = 1;
        mouldTypeLogic.classList.remove("display");
        mouldTypeLogic.classList.add("notDisplay");
        mouldTypeData.classList.remove("notDisplay");
        mouldTypeData.classList.add("display");
        mouldInfoSelectorOutputText.classList.remove("notDisplay");
        mouldInfoSelectorOutputText.classList.add("display");
        mouldInfoSelectorOutputInput.classList.remove("notDisplay");
        mouldInfoSelectorOutputInput.classList.add("display");
    }
    thisLibrary.BlockMoulds[currentCodeGraph].size.height = Math.max(parseInt(mouldHeight.value),
        thisLibrary.BlockMoulds[currentCodeGraph].logicImportNum + thisLibrary.BlockMoulds[currentCodeGraph].dataImportNum,
        thisLibrary.BlockMoulds[currentCodeGraph].logicExportNum + thisLibrary.BlockMoulds[currentCodeGraph].dataExportNum);
    mouldHeight.value = thisLibrary.BlockMoulds[currentCodeGraph].size.height;
}

window.onMouldInputsChange = () => {
    delBlockMouldBlocks(currentCodeGraph);
    if (mouldInputs.value == "") {
        thisLibrary.BlockMoulds[currentCodeGraph].codeManager.inputVariableNames = [];
        thisLibrary.BlockMoulds[currentCodeGraph].dataImportNum = 0;
        thisLibrary.BlockMoulds[currentCodeGraph].size.height = Math.max(parseInt(mouldHeight.value),
            thisLibrary.BlockMoulds[currentCodeGraph].logicImportNum + thisLibrary.BlockMoulds[currentCodeGraph].dataImportNum,
            thisLibrary.BlockMoulds[currentCodeGraph].logicExportNum + thisLibrary.BlockMoulds[currentCodeGraph].dataExportNum);
        mouldHeight.value = thisLibrary.BlockMoulds[currentCodeGraph].size.height;
        console.log(inputStrs);
        return;
    }
    let inputStrs = mouldInputs.value.split(",");
    for (let i = 0; i < inputStrs.length; i++)
        inputStrs[i] = inputStrs[i].replace(" ", "");
    thisLibrary.BlockMoulds[currentCodeGraph].codeManager.inputVariableNames = inputStrs;
    thisLibrary.BlockMoulds[currentCodeGraph].dataImportNum = thisLibrary.BlockMoulds[currentCodeGraph].codeManager.inputVariableNames.length;
    thisLibrary.BlockMoulds[currentCodeGraph].size.height = Math.max(parseInt(mouldHeight.value),
        thisLibrary.BlockMoulds[currentCodeGraph].logicImportNum + thisLibrary.BlockMoulds[currentCodeGraph].dataImportNum,
        thisLibrary.BlockMoulds[currentCodeGraph].logicExportNum + thisLibrary.BlockMoulds[currentCodeGraph].dataExportNum);
    mouldHeight.value = thisLibrary.BlockMoulds[currentCodeGraph].size.height;
    console.log(inputStrs);
}

window.onMouldOutputsChange = () => {
    delBlockMouldBlocks(currentCodeGraph);
    let outputStrs = mouldOutputs.value.split(",");
    for (let i = 0; i < outputStrs.length; i++)
        outputStrs[i] = outputStrs[i].replace(" ", "");
    console.log(outputStrs);
    thisLibrary.BlockMoulds[currentCodeGraph].codeManager.outputVariableNames = outputStrs;
    thisLibrary.BlockMoulds[currentCodeGraph].dataExportNum = 1;
    thisLibrary.BlockMoulds[currentCodeGraph].size.height = Math.max(parseInt(mouldHeight.value),
        thisLibrary.BlockMoulds[currentCodeGraph].logicImportNum + thisLibrary.BlockMoulds[currentCodeGraph].dataImportNum,
        thisLibrary.BlockMoulds[currentCodeGraph].logicExportNum + thisLibrary.BlockMoulds[currentCodeGraph].dataExportNum);
    mouldHeight.value = thisLibrary.BlockMoulds[currentCodeGraph].size.height;
    console.log(outputStrs);
}

function changeCodeGraph(index) {
    if (currentCodeGraph == index)
        return;
    if (index == 0) {
        playgroundContainer.classList.remove("playgroundContainerMould");
        playgroundContainer.classList.add("playgroundContainerMainFlow");
        mouldInfoContainer.classList.remove("display");
        mouldInfoContainer.classList.add("notDisplay");
        runButtonDiv.classList.remove("notDisplay");
        runButtonDiv.classList.add("display");
        img_runButton.classList.remove("notDisplay");
        img_runButton.classList.add("display");
        inputBuffer[currentCodeGraph] = {};
        for (let i in thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks) {
            let block = thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[i];
            if (block.blockMould.type == "input" || block.blockMould.type == "assign")
                inputBuffer[currentCodeGraph][i] = document.getElementById("b" + i).lastChild.firstChild.value;
        }
        pblocks.innerText = CodeManager.instance.graph.size;
        currentCodeGraph = index;
    } else {
        inputBuffer[currentCodeGraph] = {};
        for (let i in CodeManager.instance.graph.blocks) {
            let block = CodeManager.instance.graph.blocks[i];
            if (block.blockMould.type == "input" || block.blockMould.type == "assign")
                inputBuffer[currentCodeGraph][i] = document.getElementById("b" + i).lastChild.firstChild.value;
        }
        currentCodeGraph = index;
        playgroundContainer.classList.remove("playgroundContainerMainFlow");
        playgroundContainer.classList.add("playgroundContainerMould");
        mouldInfoContainer.classList.remove("notDisplay");
        mouldInfoContainer.classList.add("display");
        runButtonDiv.classList.remove("display");
        runButtonDiv.classList.add("notDisplay");
        img_runButton.classList.remove("display");
        img_runButton.classList.add("notDisplay");
        console.log(thisLibrary.BlockMoulds[currentCodeGraph]);
        mouldName.value = thisLibrary.BlockMoulds[currentCodeGraph].Tnames[LanguageManager.currentLanguage];
        mouldColor.value = thisLibrary.color;
        if (thisLibrary.BlockMoulds[currentCodeGraph].type == "userDefData") {
            mouldTypeLogic.classList.remove("display");
            mouldTypeLogic.classList.add("notDisplay");
            mouldTypeData.classList.remove("notDisplay");
            mouldTypeData.classList.add("display");
            mouldInfoSelectorOutputText.classList.remove("notDisplay");
            mouldInfoSelectorOutputText.classList.add("display");
            mouldInfoSelectorOutputInput.classList.remove("notDisplay");
            mouldInfoSelectorOutputInput.classList.add("display");
        } else {
            mouldTypeData.classList.remove("display");
            mouldTypeData.classList.add("notDisplay");
            mouldTypeLogic.classList.remove("notDisplay");
            mouldTypeLogic.classList.add("display");
            mouldInfoSelectorOutputText.classList.remove("display");
            mouldInfoSelectorOutputText.classList.add("notDisplay");
            mouldInfoSelectorOutputInput.classList.remove("display");
            mouldInfoSelectorOutputInput.classList.add("notDisplay");
        }
        mouldWidth.value = thisLibrary.BlockMoulds[currentCodeGraph].size.width;
        mouldHeight.value = thisLibrary.BlockMoulds[currentCodeGraph].size.height;
        let inputStr = "";
        for (let i = 0; i < thisLibrary.BlockMoulds[currentCodeGraph].codeManager.inputVariableNames.length; i++) {
            if (i != 0)
                inputStr += ", ";
            inputStr += thisLibrary.BlockMoulds[currentCodeGraph].codeManager.inputVariableNames[i];
        }
        mouldInputs.value = inputStr;
        let outputStr = "";
        for (let i = 0; i < thisLibrary.BlockMoulds[currentCodeGraph].codeManager.outputVariableNames.length; i++) {
            if (i != 0)
                outputStr += ", ";
            outputStr += thisLibrary.BlockMoulds[currentCodeGraph].codeManager.outputVariableNames[i];
        }
        pblocks.innerText = thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.size;
        mouldOutputs.value = outputStr;
    }
    clearRender();
    renderCodeGraph();
}

function renderLink(index1, port1, index2, port2, type) {
    if (currentCodeGraph == 0) {
        let y1b = port1,
            y2b = port2;
        if (type == "data") {
            y1b += CodeManager.instance.graph.blocks[index1].blockMould.logicExportNum;
            y2b += CodeManager.instance.graph.blocks[index2].blockMould.logicImportNum;
        }
        let x0, x1, y0, y1;
        let linkType = 0,
            linkY = 0;
        x0 = (CodeManager.instance.graph.blocks[index1].x + CodeManager.instance.graph.blocks[index1].blockMould.size.width) * 50 + 75;
        y0 = (CodeManager.instance.graph.blocks[index1].y + y1b) * 50 + 75;
        x1 = (CodeManager.instance.graph.blocks[index2].x) * 50 + 25;
        y1 = (CodeManager.instance.graph.blocks[index2].y + y2b) * 50 + 75;
        if (x0 > x1) {
            let tmp = x0;
            x0 = x1;
            x1 = tmp;
            linkType = 1;
        }
        if (y0 > y1) {
            let tmp = y0;
            y0 = y1;
            y1 = tmp;
            linkY = 1;
        }
        x0 -= 27.5;
        x1 += 27.5;
        y0 -= 2.5;
        y1 += 2.5;
        let svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        svg.id = "l" + index1 + "_" + port1 + "_" + index2 + "_" + port2 + "_" + type;
        svg.classList.add("connection");
        svg.style.left = x0 + "px";
        svg.style.top = y0 + "px";
        svg.style.width = x1 - x0 + "px";
        svg.style.height = y1 - y0 + "px";
        if (linkType == 0) {
            let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
            let pathstr = "M 27.5 " + (linkY == 0 ? 2.5 : ((y1 - y0) - 2.5));
            pathstr += " C " + ((x1 - x0) / 2) + " " + (linkY == 0 ? 2.5 : ((y1 - y0) - 2.5)) + " " + ((x1 - x0) / 2) + " " + (linkY == 0 ? ((y1 - y0) - 2.5) : 2.5) + " " + (x1 - x0 - 27.5) + " " + (linkY == 0 ? ((y1 - y0) - 2.5) : 2.5);
            path.setAttribute("d", pathstr);
            path.setAttribute("stroke", "var(--lightShadow)");
            path.setAttribute("stroke-width", "5px");
            path.setAttribute("fill", "none");
            path.onmouseup = (event) => {
                if (event.button == 2) {
                    let delsvg = document.getElementById("l" + index1 + "_" + port1 + "_" + index2 + "_" + port2 + "_" + type);
                    blockArea.removeChild(delsvg);
                    if (type == "logic")
                        CodeManager.instance.graph.delLogicConnection(index1, port1, index2, port2);
                    else
                        CodeManager.instance.graph.delDataConnection(index1, port1, index2, port2);
                }
            }
            svg.appendChild(path);
        } else {
            let path1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
            let pathstr1 = "M 27.5 " + (linkY == 1 ? 2.5 : ((y1 - y0) - 2.5));
            pathstr1 += " C " + 2.5 + " " + (linkY == 1 ? 2.5 : ((y1 - y0) - 2.5));
            pathstr1 += " " + 2.5 + " " + (y1 - y0) / 2;
            pathstr1 += " " + ((x1 - x0) / 2) + " " + (y1 - y0) / 2;
            path1.setAttribute("d", pathstr1);
            path1.setAttribute("stroke", "var(--lightShadow)");
            path1.setAttribute("stroke-width", "5px")
            path1.setAttribute("fill", "none");
            path1.onmouseup = (event) => {
                if (event.button == 2) {
                    let delsvg = document.getElementById("l" + index1 + "_" + port1 + "_" + index2 + "_" + port2 + "_" + type);
                    blockArea.removeChild(delsvg);
                    if (type == "logic")
                        CodeManager.instance.graph.delLogicConnection(index1, port1, index2, port2);
                    else
                        CodeManager.instance.graph.delDataConnection(index1, port1, index2, port2);
                }
            }
            svg.appendChild(path1);
            let path2 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
            let pathstr2 = "M " + (x1 - x0 - 27.5) + " " + (linkY == 1 ? ((y1 - y0) - 2.5) : 2.5);
            pathstr2 += " C " + (x1 - x0 - 2.5) + " " + (linkY == 1 ? ((y1 - y0) - 2.5) : 2.5);
            pathstr2 += " " + (x1 - x0 - 2.5) + " " + (y1 - y0) / 2;
            pathstr2 += " " + ((x1 - x0) / 2) + " " + (y1 - y0) / 2;
            path2.setAttribute("d", pathstr2);
            path2.setAttribute("stroke", "var(--lightShadow)");
            path2.setAttribute("stroke-width", "5px")
            path2.setAttribute("fill", "none");
            path2.onmouseup = (event) => {
                if (event.button == 2) {
                    let delsvg = document.getElementById("l" + index1 + "_" + port1 + "_" + index2 + "_" + port2 + "_" + type);
                    blockArea.removeChild(delsvg);
                    if (type == "logic")
                        CodeManager.instance.graph.delLogicConnection(index1, port1, index2, port2);
                    else
                        CodeManager.instance.graph.delDataConnection(index1, port1, index2, port2);
                }
            }
            svg.appendChild(path2);
        }
        blockArea.appendChild(svg);
    } else {
        let y1b = port1,
            y2b = port2;
        if (type == "data") {
            y1b += thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index1].blockMould.logicExportNum;
            y2b += thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index2].blockMould.logicImportNum;
        }
        let x0, x1, y0, y1;
        let linkType = 0,
            linkY = 0;
        x0 = (thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index1].x + thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index1].blockMould.size.width) * 50 + 75;
        y0 = (thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index1].y + y1b) * 50 + 75;
        x1 = (thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index2].x) * 50 + 25;
        y1 = (thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index2].y + y2b) * 50 + 75;
        if (x0 > x1) {
            let tmp = x0;
            x0 = x1;
            x1 = tmp;
            linkType = 1;
        }
        if (y0 > y1) {
            let tmp = y0;
            y0 = y1;
            y1 = tmp;
            linkY = 1;
        }
        x0 -= 27.5;
        x1 += 27.5;
        y0 -= 2.5;
        y1 += 2.5;
        let svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        svg.id = "l" + index1 + "_" + port1 + "_" + index2 + "_" + port2 + "_" + type;
        svg.classList.add("connection");
        svg.style.left = x0 + "px";
        svg.style.top = y0 + "px";
        svg.style.width = x1 - x0 + "px";
        svg.style.height = y1 - y0 + "px";
        if (linkType == 0) {
            let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
            let pathstr = "M 27.5 " + (linkY == 0 ? 2.5 : ((y1 - y0) - 2.5));
            pathstr += " C " + ((x1 - x0) / 2) + " " + (linkY == 0 ? 2.5 : ((y1 - y0) - 2.5)) + " " + ((x1 - x0) / 2) + " " + (linkY == 0 ? ((y1 - y0) - 2.5) : 2.5) + " " + (x1 - x0 - 27.5) + " " + (linkY == 0 ? ((y1 - y0) - 2.5) : 2.5);
            path.setAttribute("d", pathstr);
            path.setAttribute("stroke", "var(--lightShadow)");
            path.setAttribute("stroke-width", "5px");
            path.setAttribute("fill", "none");
            path.onmouseup = (event) => {
                if (event.button == 2) {
                    let delsvg = document.getElementById("l" + index1 + "_" + port1 + "_" + index2 + "_" + port2 + "_" + type);
                    blockArea.removeChild(delsvg);
                    if (type == "logic")
                        thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.delLogicConnection(index1, port1, index2, port2);
                    else
                        thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.delDataConnection(index1, port1, index2, port2);
                }
            }
            svg.appendChild(path);
        } else {
            let path1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
            let pathstr1 = "M 27.5 " + (linkY == 1 ? 2.5 : ((y1 - y0) - 2.5));
            pathstr1 += " C " + 2.5 + " " + (linkY == 1 ? 2.5 : ((y1 - y0) - 2.5));
            pathstr1 += " " + 2.5 + " " + (y1 - y0) / 2;
            pathstr1 += " " + ((x1 - x0) / 2) + " " + (y1 - y0) / 2;
            path1.setAttribute("d", pathstr1);
            path1.setAttribute("stroke", "var(--lightShadow)");
            path1.setAttribute("stroke-width", "5px")
            path1.setAttribute("fill", "none");
            path1.onmouseup = (event) => {
                if (event.button == 2) {
                    let delsvg = document.getElementById("l" + index1 + "_" + port1 + "_" + index2 + "_" + port2 + "_" + type);
                    blockArea.removeChild(delsvg);
                    if (type == "logic")
                        thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.delLogicConnection(index1, port1, index2, port2);
                    else
                        thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.delDataConnection(index1, port1, index2, port2);
                }
            }
            svg.appendChild(path1);
            let path2 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
            let pathstr2 = "M " + (x1 - x0 - 27.5) + " " + (linkY == 1 ? ((y1 - y0) - 2.5) : 2.5);
            pathstr2 += " C " + (x1 - x0 - 2.5) + " " + (linkY == 1 ? ((y1 - y0) - 2.5) : 2.5);
            pathstr2 += " " + (x1 - x0 - 2.5) + " " + (y1 - y0) / 2;
            pathstr2 += " " + ((x1 - x0) / 2) + " " + (y1 - y0) / 2;
            path2.setAttribute("d", pathstr2);
            path2.setAttribute("stroke", "var(--lightShadow)");
            path2.setAttribute("stroke-width", "5px")
            path2.setAttribute("fill", "none");
            path2.onmouseup = (event) => {
                if (event.button == 2) {
                    let delsvg = document.getElementById("l" + index1 + "_" + port1 + "_" + index2 + "_" + port2 + "_" + type);
                    blockArea.removeChild(delsvg);
                    if (type == "logic")
                        thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.delLogicConnection(index1, port1, index2, port2);
                    else
                        thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.delDataConnection(index1, port1, index2, port2);
                }
            }
            svg.appendChild(path2);
        }
        blockArea.appendChild(svg);
    }
}

function renderBlock(index) {
    if (currentCodeGraph == 0) {
        let block = CodeManager.instance.graph.blocks[index];
        let div = document.createElement('div');
        div.id = "b" + index;
        div.classList.add("block");
        div.draggable = true;
        div.ondragstart = () => {
            dragType = "block";
            let tmpblock = document.getElementById("b" + index);
            tmpblock.style.zIndex = 20;
            dragDivArea.classList.remove("notDisplay");
            dragDivArea.classList.add("display");
            chosedBlockIndex = index;
        }
        div.onmouseup = (event) => {
            if (event.button == 2) {
                let tmpblock = document.getElementById("b" + index);
                console.log(CodeManager.instance.graph.blocks[index].logicImports);
                for (let i = 0; i < CodeManager.instance.graph.blocks[index].blockMould.logicImportNum; i++) {
                    for (let j = 0; j < CodeManager.instance.graph.blocks[index].logicImports[i].length; j++) {
                        let link = document.getElementById("l" + CodeManager.instance.graph.blocks[index].logicImports[i][j] +
                            "_" + CodeManager.instance.graph.blocks[CodeManager.instance.graph.blocks[index].logicImports[i][j]].searchLogicExport(index) +
                            "_" + index + "_" + i + "_" + "logic");
                        console.log("l" + CodeManager.instance.graph.blocks[index].logicImports[i][j] +
                            "_" + CodeManager.instance.graph.blocks[CodeManager.instance.graph.blocks[index].logicImports[i][j]].searchLogicExport(index) +
                            "_" + index + "_" + i + "_" + "logic");
                        blockArea.removeChild(link);
                    }
                }
                for (let i = 0; i < CodeManager.instance.graph.blocks[index].blockMould.logicExportNum; i++) {
                    for (let j = 0; j < CodeManager.instance.graph.blocks[index].logicExports[i].length; j++) {
                        let link = document.getElementById("l" + index + "_" + i +
                            "_" + CodeManager.instance.graph.blocks[index].logicExports[i][j] +
                            "_" + CodeManager.instance.graph.blocks[CodeManager.instance.graph.blocks[index].logicExports[i][j]].searchLogicImport(index) +
                            "_" + "logic");
                        console.log("l" + index + "_" + i +
                            "_" + CodeManager.instance.graph.blocks[index].logicExports[i][j] +
                            "_" + CodeManager.instance.graph.blocks[CodeManager.instance.graph.blocks[index].logicExports[i][j]].searchLogicImport(index) +
                            "_" + "logic");
                        blockArea.removeChild(link);
                    }
                }
                for (let i = 0; i < CodeManager.instance.graph.blocks[index].blockMould.dataImportNum; i++) {
                    if (CodeManager.instance.graph.blocks[index].dataImports[i] == -1)
                        continue;
                    let link = document.getElementById("l" + CodeManager.instance.graph.blocks[index].dataImports[i] +
                        "_" + CodeManager.instance.graph.blocks[CodeManager.instance.graph.blocks[index].dataImports[i]].searchDataExport(index) +
                        "_" + index + "_" + i + "_" + "data");
                    console.log("l" + CodeManager.instance.graph.blocks[index].dataImports[i] +
                        "_" + CodeManager.instance.graph.blocks[CodeManager.instance.graph.blocks[index].dataImports[i]].searchDataExport(index) +
                        "_" + index + "_" + i + "_" + "data");
                    blockArea.removeChild(link);
                }
                for (let i = 0; i < CodeManager.instance.graph.blocks[index].blockMould.dataExportNum; i++) {
                    for (let j = 0; j < CodeManager.instance.graph.blocks[index].dataExports[i].length; j++) {
                        let link = document.getElementById("l" + index + "_" + i +
                            "_" + CodeManager.instance.graph.blocks[index].dataExports[i][j] +
                            "_" + CodeManager.instance.graph.blocks[CodeManager.instance.graph.blocks[index].dataExports[i][j]].searchDataImport(index) +
                            "_" + "data");
                        console.log("l" + index + "_" + i +
                            "_" + CodeManager.instance.graph.blocks[index].dataExports[i][j] +
                            "_" + CodeManager.instance.graph.blocks[CodeManager.instance.graph.blocks[index].dataExports[i][j]].searchDataImport(index) +
                            "_" + "data");
                        blockArea.removeChild(link);
                    }
                }
                blockArea.removeChild(tmpblock);
                CodeManager.instance.delBlock(index);
                pblocks.innerText = CodeManager.instance.graph.size;
            } else {
                /*if (CodeManager.instance.graph.blocks[index].blockMould.type == "output") {
                    var text = document.getElementById("out" + index).innerText;
                    if (navigator.clipboard && window.isSecureContext)
                        navigator.clipboard.writeText(text);
                    else {
                        let textArea = document.createElement("textarea");
                        textArea.value = text;
                        textArea.style.position = "absolute";
                        textArea.style.display = "none";
                        textArea.style.opacity = 0;
                        textArea.style.left = "0px";
                        textArea.style.top = "0px";
                        document.body.appendChild(textArea);
                        textArea.focus();
                        textArea.select();
                        return new Promise((res, rej) => {
                            document.execCommand('copy') ? res() : rej();
                            textArea.remove();
                        });
                    }
                }*/
            }
        }
        div.ondragend = () => {
            let tmpblock = document.getElementById("b" + index);
            dragDivArea.classList.remove("display");
            dragDivArea.classList.add("notDisplay");
            shadowBlock.classList.remove("display");
            shadowBlock.classList.add("notDisplay");
            tmpblock.style.zIndex = 5;
            shadowActivated = false;
        }
        for (let i = 0; i < CodeManager.instance.graph.blocks[index].blockMould.logicImportNum; i++) {
            let port = document.createElement("div");
            port.style.left = "4px";
            port.style.top = i * 50 + 25 + 17.5 + "px";
            port.classList.add("logicport");
            port.classList.add("logicportHover");
            port.onclick = () => {
                if (port1.type == "none") {
                    port1 = {
                        type: "logicImport",
                        blockIndex: index,
                        portIndex: i
                    }
                } else if (port1.type == "logicExport") {
                    if (CodeManager.instance.isConnectionAvailable(port1.blockIndex, index, i, port1.portIndex, "logic")) {
                        CodeManager.instance.graph.addLogicConnection(port1.blockIndex, port1.portIndex, index, i);
                        renderLink(port1.blockIndex, port1.portIndex, index, i, "logic");
                    }
                    port1 = {
                        type: "none",
                        blockIndex: -1,
                        portIndex: -1
                    }
                } else {
                    port1 = {
                        type: "none",
                        blockIndex: -1,
                        portIndex: -1
                    }
                }
            }
            div.appendChild(port);
        }
        for (let i = 0; i < CodeManager.instance.graph.blocks[index].blockMould.dataImportNum; i++) {
            let port = document.createElement("div");
            port.style.left = "4px";
            port.style.top = (CodeManager.instance.graph.blocks[index].blockMould.logicImportNum + i) * 50 + 25 + 17.5 + "px";
            port.classList.add("dataport");
            port.classList.add("dataportHover");
            port.onclick = () => {
                if (port1.type == "none") {
                    port1 = {
                        type: "dataImport",
                        blockIndex: index,
                        portIndex: i
                    }
                } else if (port1.type == "dataExport") {
                    if (CodeManager.instance.isConnectionAvailable(port1.blockIndex, index, i, port1.portIndex, "data")) {
                        CodeManager.instance.graph.addDataConnection(port1.blockIndex, port1.portIndex, index, i);
                        renderLink(port1.blockIndex, port1.portIndex, index, i, "data");
                    }
                    port1 = {
                        type: "none",
                        blockIndex: -1,
                        portIndex: -1
                    }
                } else {
                    port1 = {
                        type: "none",
                        blockIndex: -1,
                        portIndex: -1
                    }
                }
            }
            div.appendChild(port);
        }
        for (let i = 0; i < CodeManager.instance.graph.blocks[index].blockMould.logicExportNum; i++) {
            let port = document.createElement("div");
            port.style.right = "4px";
            port.style.top = i * 50 + 25 + 17.5 + "px";
            port.classList.add("logicport");
            port.classList.add("logicportHover");
            port.onclick = () => {
                if (port1.type == "none") {
                    port1 = {
                        type: "logicExport",
                        blockIndex: index,
                        portIndex: i
                    }
                } else if (port1.type == "logicImport") {
                    if (CodeManager.instance.isConnectionAvailable(index, port1.blockIndex, port1.portIndex, i, "logic")) {
                        CodeManager.instance.graph.addLogicConnection(index, i, port1.blockIndex, port1.portIndex);
                        renderLink(index, i, port1.blockIndex, port1.portIndex, "logic");
                    }
                    port1 = {
                        type: "none",
                        blockIndex: -1,
                        portIndex: -1
                    }
                } else {
                    port1 = {
                        type: "none",
                        blockIndex: -1,
                        portIndex: -1
                    }
                }
            }
            div.appendChild(port);
        }
        for (let i = 0; i < CodeManager.instance.graph.blocks[index].blockMould.dataExportNum; i++) {
            let port = document.createElement("div");
            port.style.right = "4px";
            port.style.top = (CodeManager.instance.graph.blocks[index].blockMould.logicExportNum + i) * 50 + 25 + 17.5 + "px";
            port.classList.add("dataport");
            port.classList.add("dataportHover");
            port.onclick = () => {
                if (port1.type == "none") {
                    port1 = {
                        type: "dataExport",
                        blockIndex: index,
                        portIndex: i
                    }
                } else if (port1.type == "dataImport") {
                    if (CodeManager.instance.isConnectionAvailable(index, port1.blockIndex, port1.portIndex, i, "data")) {
                        CodeManager.instance.graph.addDataConnection(index, i, port1.blockIndex, port1.portIndex);
                        renderLink(index, i, port1.blockIndex, port1.portIndex, "data");
                    }
                    port1 = {
                        type: "none",
                        blockIndex: -1,
                        portIndex: -1
                    }
                } else {
                    port1 = {
                        type: "none",
                        blockIndex: -1,
                        portIndex: -1
                    }
                }
            }
            div.appendChild(port);
        }
        let divblock = document.createElement("div");
        divblock.classList.add("blockdiv");
        switch (block.blockMould.type) {
            case "input":
                let input = document.createElement("input");
                input.className = "blockInput";
                input.classList.add("inputBorder");
                divblock.appendChild(input);
                break;
            case "assign":
                let assign = document.createElement("input");
                assign.className = "blockAssign";
                assign.classList.add("inputBorder");
                divblock.appendChild(assign);
                break;
            case "output":
                if (block.blockMould.nameID == "output") {
                    let output = document.createElement("p");
                    output.className = "blockp";
                    output.id = "out" + index;
                    divblock.appendChild(output);
                    break;
                } else if (block.blockMould.nameID == "Loutput") {
                    let output = document.createElement("p");
                    output.className = "blocklp";
                    output.id = "out" + index;
                    divblock.appendChild(output);
                    break;
                }
            default:
                let p = document.createElement("p");
                p.className = "blockp";
                p.setAttribute("name", block.blockMould.lib + "_" + block.blockMould.nameID);
                console.log(block.blockMould, block.blockMould.lib + "_" + block.blockMould.nameID);
                p.innerText = LanguageManager.phrases[block.blockMould.lib + "_" + block.blockMould.nameID][LanguageManager.currentLanguage];
                divblock.appendChild(p);
                break;
        }
        div.appendChild(divblock);
        if ((block.blockMould.type == "input" || block.blockMould.type == "assign") && index in inputBuffer[currentCodeGraph])
            div.lastChild.firstChild.value = inputBuffer[currentCodeGraph][index];
        div.title = index + ": \"" + LanguageManager.phrases[block.blockMould.lib + "_" + block.blockMould.nameID]["English"] + "\"";
        div.style.width = (block.blockMould.size.width + 1) * 50 + "px";
        div.style.height = (block.blockMould.size.height + 1) * 50 + "px";
        div.style.left = block.x * 50 + 25 + "px";
        div.style.top = block.y * 50 + 25 + "px";
        return div;
    } else {
        let block = thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index];
        let div = document.createElement('div');
        div.id = "b" + index;
        div.classList.add("block");
        div.draggable = true;
        div.ondragstart = () => {
            dragType = "block";
            let tmpblock = document.getElementById("b" + index);
            tmpblock.style.zIndex = 20;
            dragDivArea.classList.remove("notDisplay");
            dragDivArea.classList.add("display");
            chosedBlockIndex = index;
        }
        div.onmouseup = (event) => {
            if (event.button == 2) {
                let tmpblock = document.getElementById("b" + index);
                for (let i = 0; i < thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].blockMould.logicImportNum; i++) {
                    for (let j = 0; j < thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].logicImports[i].length; j++) {
                        let link = document.getElementById("l" + thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].logicImports[i][j] +
                            "_" + thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].logicImports[i][j]].searchLogicExport(index) +
                            "_" + index + "_" + i + "_" + "logic");
                        blockArea.removeChild(link);
                    }
                }
                for (let i = 0; i < thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].blockMould.logicExportNum; i++) {
                    for (let j = 0; j < thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].logicExports[i].length; j++) {
                        let link = document.getElementById("l" + index + "_" + i +
                            "_" + thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].logicExports[i][j] +
                            "_" + thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].logicExports[i][j]].searchLogicImport(index) +
                            "_" + "logic");
                        blockArea.removeChild(link);
                    }
                }
                for (let i = 0; i < thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].blockMould.dataImportNum; i++) {
                    if (thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].dataImports[i] == -1)
                        continue;
                    let link = document.getElementById("l" + thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].dataImports[i] +
                        "_" + thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].dataImports[i]].searchDataExport(index) +
                        "_" + index + "_" + i + "_" + "data");
                    blockArea.removeChild(link);
                }
                for (let i = 0; i < thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].blockMould.dataExportNum; i++) {
                    for (let j = 0; j < thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].dataExports[i].length; j++) {
                        let link = document.getElementById("l" + index + "_" + i +
                            "_" + thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].dataExports[i][j] +
                            "_" + thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].dataExports[i][j]].searchDataImport(index) +
                            "_" + "data");
                        blockArea.removeChild(link);
                    }
                }
                blockArea.removeChild(tmpblock);
                thisLibrary.BlockMoulds[currentCodeGraph].codeManager.delBlock(index);
                pblocks.innerText = thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.size;
            } else {
                /*if (thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].blockMould.type == "output") {
                    var text = document.getElementById("out" + index).innerText;
                    if (navigator.clipboard && window.isSecureContext)
                        navigator.clipboard.writeText(text);
                    else {
                        let textArea = document.createElement("textarea");
                        textArea.value = text;
                        textArea.style.position = "absolute";
                        textArea.style.display = "none";
                        textArea.style.opacity = 0;
                        textArea.style.left = "0px";
                        textArea.style.top = "0px";
                        document.body.appendChild(textArea);
                        textArea.focus();
                        textArea.select();
                        return new Promise((res, rej) => {
                            document.execCommand('copy') ? res() : rej();
                            textArea.remove();
                        });
                    }
                }*/
            }
        }
        div.ondragend = () => {
            let tmpblock = document.getElementById("b" + index);
            dragDivArea.classList.remove("display");
            dragDivArea.classList.add("notDisplay");
            shadowBlock.classList.remove("display");
            shadowBlock.classList.add("notDisplay");
            tmpblock.style.zIndex = 5;
            shadowActivated = false;
        }
        for (let i = 0; i < thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].blockMould.logicImportNum; i++) {
            let port = document.createElement("div");
            port.style.left = "4px";
            port.style.top = i * 50 + 25 + 17.5 + "px";
            port.classList.add("logicport");
            port.classList.add("logicportHover");
            port.onclick = () => {
                if (port1.type == "none") {
                    port1 = {
                        type: "logicImport",
                        blockIndex: index,
                        portIndex: i
                    }
                } else if (port1.type == "logicExport") {
                    if (thisLibrary.BlockMoulds[currentCodeGraph].codeManager.isConnectionAvailable(port1.blockIndex, index, i, port1.portIndex, "logic")) {
                        thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.addLogicConnection(port1.blockIndex, port1.portIndex, index, i);
                        renderLink(port1.blockIndex, port1.portIndex, index, i, "logic");
                    }
                    port1 = {
                        type: "none",
                        blockIndex: -1,
                        portIndex: -1
                    }
                } else {
                    port1 = {
                        type: "none",
                        blockIndex: -1,
                        portIndex: -1
                    }
                }
            }
            div.appendChild(port);
        }
        for (let i = 0; i < thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].blockMould.dataImportNum; i++) {
            let port = document.createElement("div");
            port.style.left = "4px";
            port.style.top = (thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].blockMould.logicImportNum + i) * 50 + 25 + 17.5 + "px";
            port.classList.add("dataport");
            port.classList.add("dataportHover");
            port.onclick = () => {
                if (port1.type == "none") {
                    port1 = {
                        type: "dataImport",
                        blockIndex: index,
                        portIndex: i
                    }
                } else if (port1.type == "dataExport") {
                    if (thisLibrary.BlockMoulds[currentCodeGraph].codeManager.isConnectionAvailable(port1.blockIndex, index, i, port1.portIndex, "data")) {
                        thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.addDataConnection(port1.blockIndex, port1.portIndex, index, i);
                        renderLink(port1.blockIndex, port1.portIndex, index, i, "data");
                    }
                    port1 = {
                        type: "none",
                        blockIndex: -1,
                        portIndex: -1
                    }
                } else {
                    port1 = {
                        type: "none",
                        blockIndex: -1,
                        portIndex: -1
                    }
                }
            }
            div.appendChild(port);
        }
        for (let i = 0; i < thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].blockMould.logicExportNum; i++) {
            let port = document.createElement("div");
            port.style.right = "4px";
            port.style.top = i * 50 + 25 + 17.5 + "px";
            port.classList.add("logicport");
            port.classList.add("logicportHover");
            port.onclick = () => {
                if (port1.type == "none") {
                    port1 = {
                        type: "logicExport",
                        blockIndex: index,
                        portIndex: i
                    }
                } else if (port1.type == "logicImport") {
                    if (thisLibrary.BlockMoulds[currentCodeGraph].codeManager.isConnectionAvailable(index, port1.blockIndex, port1.portIndex, i, "logic")) {
                        thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.addLogicConnection(index, i, port1.blockIndex, port1.portIndex);
                        renderLink(index, i, port1.blockIndex, port1.portIndex, "logic");
                    }
                    port1 = {
                        type: "none",
                        blockIndex: -1,
                        portIndex: -1
                    }
                } else {
                    port1 = {
                        type: "none",
                        blockIndex: -1,
                        portIndex: -1
                    }
                }
            }
            div.appendChild(port);
        }
        for (let i = 0; i < thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].blockMould.dataExportNum; i++) {
            let port = document.createElement("div");
            port.style.right = "4px";
            port.style.top = (thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[index].blockMould.logicExportNum + i) * 50 + 25 + 17.5 + "px";
            port.classList.add("dataport");
            port.classList.add("dataportHover");
            port.onclick = () => {
                if (port1.type == "none") {
                    port1 = {
                        type: "dataExport",
                        blockIndex: index,
                        portIndex: i
                    }
                } else if (port1.type == "dataImport") {
                    if (thisLibrary.BlockMoulds[currentCodeGraph].codeManager.isConnectionAvailable(index, port1.blockIndex, port1.portIndex, i, "data")) {
                        thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.addDataConnection(index, i, port1.blockIndex, port1.portIndex);
                        renderLink(index, i, port1.blockIndex, port1.portIndex, "data");
                    }
                    port1 = {
                        type: "none",
                        blockIndex: -1,
                        portIndex: -1
                    }
                } else {
                    port1 = {
                        type: "none",
                        blockIndex: -1,
                        portIndex: -1
                    }
                }
            }
            div.appendChild(port);
        }
        let divblock = document.createElement("div");
        divblock.classList.add("blockdiv");
        switch (block.blockMould.type) {
            case "input":
                let input = document.createElement("input");
                input.className = "blockInput";
                input.classList.add("inputBorder");
                divblock.appendChild(input);
                break;
            case "assign":
                let assign = document.createElement("input");
                assign.className = "blockAssign";
                assign.classList.add("inputBorder");
                divblock.appendChild(assign);
                break;
            case "output":
                if (block.blockMould.nameID == "output") {
                    let output = document.createElement("p");
                    output.className = "blockp";
                    output.id = "out" + index;
                    divblock.appendChild(output);
                    break;
                } else if (block.blockMould.nameID == "Loutput") {
                    let output = document.createElement("p");
                    output.className = "blocklp";
                    output.id = "out" + index;
                    divblock.appendChild(output);
                    break;
                }
            default:
                let p = document.createElement("p");
                p.className = "blockp";
                p.setAttribute("name", block.blockMould.lib + "_" + block.blockMould.nameID);
                p.innerText = LanguageManager.phrases[block.blockMould.lib + "_" + block.blockMould.nameID][LanguageManager.currentLanguage];
                divblock.appendChild(p);
                break;
        }
        div.appendChild(divblock);
        if ((block.blockMould.type == "input" || block.blockMould.type == "assign") && index in inputBuffer[currentCodeGraph])
            div.lastChild.firstChild.value = inputBuffer[currentCodeGraph][index];
        div.title = index + ": \"" + LanguageManager.phrases[block.blockMould.lib + "_" + block.blockMould.nameID]["English"] + "\"";
        div.style.width = (block.blockMould.size.width + 1) * 50 + "px";
        div.style.height = (block.blockMould.size.height + 1) * 50 + "px";
        div.style.left = block.x * 50 + 25 + "px";
        div.style.top = block.y * 50 + 25 + "px";
        return div;
    }
}

function clearRender() {
    for (; blockArea.children.length > 1;)
        blockArea.removeChild(blockArea.children[1]);
}

function initCode() {
    changeCodeGraph(0);
    blockLibDisplay = "disabled";
    chosedBlockMould = null;
    chosedBlockIndex = null;
    shadowActivated = false;
    dragType = "";
    if (worker)
        worker.terminate();
    worker = undefined;
    port1 = {
        type: "none",
        blockIndex: -1,
        portIndex: -1
    };
    isCodeRunning = false;
    fileName = "Untitled";
    mouldNum = 1;
    thisLibrary = new BlockLibrary("Untitled", { "English": "Untitled", "Chinese": "未命名" }, "#2c9678");
    BLibMouldsContainer.innerHTML = null;
    currentCodeGraph = 0;
    fileNameInput.setAttribute("value", fileName);
    inputBuffer = { 0: {} };
    clearRender();
    CodeManager.instance.graph = new Graph();
    CodeManager.instance.blockCoords = {};
    pblocks.innerText = CodeManager.instance.graph.size;
}

function renderCodeGraph() {
    if (currentCodeGraph == 0) {
        for (let i in CodeManager.instance.graph.blocks) {
            let numI = parseInt(i);
            let block = CodeManager.instance.graph.blocks[i];
            blockArea.appendChild(renderBlock(numI));
            for (let j = 0; j < block.logicExports.length; j++) {
                for (let k = 0; k < block.logicExports[j].length; k++) {
                    let nxtIndex = block.logicExports[j][k];
                    renderLink(numI, j, nxtIndex, CodeManager.instance.graph.blocks[nxtIndex].searchLogicImport(numI), "logic");
                }
            }
            for (let j = 0; j < block.dataExports.length; j++) {
                for (let k = 0; k < block.dataExports[j].length; k++) {
                    let nxtIndex = block.dataExports[j][k];
                    renderLink(numI, j, nxtIndex, CodeManager.instance.graph.blocks[nxtIndex].searchDataImport(numI), "data");
                }
            }
        }
    } else {
        for (let i in thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks) {
            let numI = parseInt(i);
            let block = thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[i];
            blockArea.appendChild(renderBlock(numI));
            for (let j = 0; j < block.logicExports.length; j++) {
                for (let k = 0; k < block.logicExports[j].length; k++) {
                    let nxtIndex = block.logicExports[j][k];
                    renderLink(numI, j, nxtIndex, thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[nxtIndex].searchLogicImport(numI), "logic");
                }
            }
            for (let j = 0; j < block.dataExports.length; j++) {
                for (let k = 0; k < block.dataExports[j].length; k++) {
                    let nxtIndex = block.dataExports[j][k];
                    renderLink(numI, j, nxtIndex, thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[nxtIndex].searchDataImport(numI), "data");
                }
            }
        }
    }
}

function eraseBlockLibDisplay() {
    opBlockElementSelector.innerText = "";
}

function deactivate() {
    if (blockLibDisplay != "disabled") {
        eraseBlockLibDisplay();
        opBlockElementSelector.style.top = "-180px";
        blockLibDisplay = "disabled";
    }
    switch (activated) {
        case "file":
            opFileSelector.classList.remove("selectorAppear");
            opFileSelector.classList.add("selectorDisappear");
            break;
        case "block":
            opBlockSelector.classList.remove("selectorAppear");
            opBlockSelector.classList.add("selectorDisappear");
            break;
        case "setting":
            opSettingSelector.classList.remove("selectorAppear");
            opSettingSelector.classList.add("selectorDisappear");
            break;
    }
    activated = "disabled";
}

window.contentElementFileClicked = () => {
    if (activated == "file") {
        opFileSelector.classList.remove("selectorAppear");
        opFileSelector.classList.add("selectorDisappear");
        activated = "disabled";
    } else {
        deactivate();
        opFileSelector.scrollTop = 0;
        opFileSelector.classList.remove("selectorDisappear");
        opFileSelector.classList.add("selectorAppear");
        activated = "file";
    }
}

window.contentElementBlockClicked = () => {
    if (activated == "block") {
        opBlockSelector.classList.remove("selectorAppear");
        opBlockSelector.classList.add("selectorDisappear");
        activated = "disabled";
        eraseBlockLibDisplay();
        opBlockElementSelector.style.top = "-180px";
        blockLibDisplay = "disabled";
    } else {
        deactivate();
        opBlockSelector.scrollTop = 0;
        opBlockSelector.classList.remove("selectorDisappear");
        opBlockSelector.classList.add("selectorAppear");
        activated = "block";
    }
}

window.contentElementTutorialClicked = () => {}

window.contentElementSettingClicked = () => {
    if (activated == "setting") {
        opSettingSelector.classList.remove("selectorAppear");
        opSettingSelector.classList.add("selectorDisappear");
        activated = "disabled";
    } else {
        deactivate();
        opSettingSelector.scrollTop = 0;
        opSettingSelector.classList.remove("selectorDisappear");
        opSettingSelector.classList.add("selectorAppear");
        activated = "setting";
    }
}

window.newFileClicked = () => {
    initCode();
}

window.loadLibrary = () => {
    let input = FileOperator.openFile();
    let reader = new FileReader();
    input.onchange = () => {
        reader.readAsText(input.files[0]);
        reader.onload = () => {
            let res = JSON.parse(reader.result);
            let loadedLib = new BlockLibrary(res.fileName, { "English": res.fileName, "Chinese": res.fileName }, "#2c9678");
            let libMem = {};

            function obj2Llib(obj) {
                loadedLib.nameID = obj.Blib.nameID;
                loadedLib.color = obj.Blib.color;
                for (let i in obj.Blib.moulds) {
                    let index = parseInt(i);
                    loadedLib.addNewMould(index);
                    loadedLib.BlockMoulds[index].codeManager = new CodeManager();
                    console.log(obj.Blib.moulds[i]);
                    console.log(loadedLib.BlockMoulds[index]);
                    loadedLib.BlockMoulds[index].nameID = obj.Blib.moulds[i].nameID;
                    loadedLib.BlockMoulds[index].Tnames = obj.Blib.moulds[i].Tnames;
                    loadedLib.BlockMoulds[index].generalType = obj.Blib.moulds[i].generalType;
                    loadedLib.BlockMoulds[index].type = obj.Blib.moulds[i].type;
                    loadedLib.BlockMoulds[index].lib = obj.Blib.moulds[i].lib;
                    loadedLib.BlockMoulds[index].size = obj.Blib.moulds[i].size;
                    loadedLib.BlockMoulds[index].logicImportNum = obj.Blib.moulds[i].logicImportNum;
                    loadedLib.BlockMoulds[index].logicExportNum = obj.Blib.moulds[i].logicExportNum;
                    loadedLib.BlockMoulds[index].dataImportNum = obj.Blib.moulds[i].dataImportNum;
                    loadedLib.BlockMoulds[index].dataExportNum = obj.Blib.moulds[i].dataExportNum;
                    loadedLib.BlockMoulds[index].codeManager.type = obj.Blib.moulds[i].codeManager.type;
                    loadedLib.BlockMoulds[index].codeManager.inputVariableNames = obj.Blib.moulds[i].codeManager.inputVariableNames;
                    loadedLib.BlockMoulds[index].codeManager.outputVariableNames = obj.Blib.moulds[i].codeManager.outputVariableNames;
                    loadedLib.BlockMoulds[index].codeManager.outputPort = obj.Blib.moulds[i].codeManager.outputPort;
                    loadedLib.BlockMoulds[index].codeManager.graph.emptyIndex = obj.Blib.moulds[i].codeManager.graph.emptyIndex;
                    loadedLib.BlockMoulds[index].codeManager.graph.size = obj.Blib.moulds[i].codeManager.graph.size;
                    LanguageManager.addPhrase(loadedLib.nameID + "_" + loadedLib.BlockMoulds[index].nameID, loadedLib.BlockMoulds[index].Tnames);
                    libMem[index] = {};
                }
                for (let i in obj.Blib.moulds) {
                    let index = parseInt(i);
                    for (let j in obj.Blib.moulds[i].codeManager.graph.blocks) {
                        let numI = parseInt(j);
                        let block = obj.Blib.moulds[i].codeManager.graph.blocks[numI];
                        if (block.library in BlockLibraryManager.instance.libraries && block.nameID in BlockLibraryManager.instance.libraries[block.library].BlockMoulds) {
                            loadedLib.BlockMoulds[index].codeManager.graph.blocks[numI] = new Block(numI, block.x, block.y, BlockLibraryManager.instance.libraries[block.library].BlockMoulds[block.nameID]);
                            loadedLib.BlockMoulds[index].codeManager.blockCoords[numI] = ({
                                x1: block.x,
                                x2: block.x + BlockLibraryManager.instance.libraries[block.library].BlockMoulds[block.nameID].size.width + 1,
                                y1: block.y,
                                y2: block.y + BlockLibraryManager.instance.libraries[block.library].BlockMoulds[block.nameID].size.height + 1
                            });
                        } else if (block.library == loadedLib.nameID && block.nameID in loadedLib.BlockMoulds) {
                            loadedLib.BlockMoulds[index].codeManager.graph.blocks[numI] = new Block(numI, block.x, block.y, loadedLib.BlockMoulds[block.nameID]);
                            loadedLib.BlockMoulds[index].codeManager.blockCoords[numI] = ({
                                x1: block.x,
                                x2: block.x + loadedLib.BlockMoulds[block.nameID].size.width + 1,
                                y1: block.y,
                                y2: block.y + loadedLib.BlockMoulds[block.nameID].size.height + 1
                            });
                        }
                        loadedLib.BlockMoulds[index].codeManager.graph.blocks[numI].logicImports = block.logicImports;
                        loadedLib.BlockMoulds[index].codeManager.graph.blocks[numI].logicExports = block.logicExports;
                        loadedLib.BlockMoulds[index].codeManager.graph.blocks[numI].dataImports = block.dataImports;
                        loadedLib.BlockMoulds[index].codeManager.graph.blocks[numI].dataExports = block.dataExports;
                        libMem[index][numI] = block.input;
                    }
                }

            }

            fileName = res.fileName;
            mouldNum = res.mouldNum;
            console.log("Load Library: ", fileName);
            fileNameInput.setAttribute("value", fileName);

            obj2Llib(res);
            loadedLibraries[res.fileName] = loadedLib;
            newLibMem[res.fileName] = libMem;

            console.log(loadedLib);
            console.log(newLibMem);

            let blockLib = loadedLib.nameID;
            let div = document.createElement("div");
            div.classList.add("selectorElement");
            div.classList.add("contentHover");
            div.onclick = () => {
                if (blockLibDisplay == blockLib) {
                    eraseBlockLibDisplay();
                    opBlockElementSelector.style.top = "-180px";
                    blockLibDisplay = "disabled";
                    return;
                }
                blockLibDisplay = blockLib;
                eraseBlockLibDisplay();
                for (let blockMould in loadedLib.BlockMoulds) {
                    let div2 = document.createElement("div");
                    div2.classList.add("selectorElement");
                    div2.classList.add("contentHover");
                    div2.draggable = true;

                    div2.ondragstart = () => {
                        dragType = "mould";
                        dragDivArea.classList.remove("notDisplay");
                        dragDivArea.classList.add("display");
                        chosedBlockMould = loadedLib.BlockMoulds[blockMould];
                        console.log(chosedBlockMould);
                    };
                    div2.ondragend = () => {
                        dragDivArea.classList.remove("display");
                        dragDivArea.classList.add("notDisplay");
                        shadowBlock.classList.remove("display");
                        shadowBlock.classList.add("notDisplay");
                        shadowActivated = false;
                    }

                    let p2 = document.createElement("p");
                    p2.setAttribute("name", blockLib + "_" + blockMould);
                    p2.innerText = LanguageManager.phrases[blockLib + "_" + blockMould][LanguageManager.currentLanguage];
                    div2.appendChild(p2);
                    opBlockElementSelector.appendChild(div2);
                }
                opBlockElementSelector.style.top = "95px";
                opBlockElementSelector.scrollTop = 0;
                return;
            };
            let p = document.createElement("p");
            LanguageManager.addPhrase(blockLib, { "English": blockLib, "Chinese": blockLib });
            p.setAttribute("name", blockLib);
            p.innerText = blockLib;
            div.appendChild(p);
            opBlockSelector.appendChild(div);
        }
    };
    input.click();
}

window.openFileClicked = () => {
    let input = FileOperator.openFile();
    let reader = new FileReader();
    initCode();
    input.onchange = () => {
        reader.readAsText(input.files[0]);
        reader.onload = () => {
            let res = JSON.parse(reader.result);

            function obj2graph(obj) {
                console.log(obj);
                CodeManager.instance.graph.size = obj.graph.size;
                pblocks.innerText = CodeManager.instance.graph.size;
                CodeManager.instance.graph.emptyIndex = obj.graph.emptyIndex;
                for (let i in obj.graph.blocks) {
                    let numI = parseInt(i);
                    let block = obj.graph.blocks[i];
                    if (block.library in BlockLibraryManager.instance.libraries && block.nameID in BlockLibraryManager.instance.libraries[block.library].BlockMoulds) {
                        CodeManager.instance.graph.blocks[numI] = new Block(numI, block.x, block.y, BlockLibraryManager.instance.libraries[block.library].BlockMoulds[block.nameID]);
                        CodeManager.instance.blockCoords[numI] = ({
                            x1: block.x,
                            x2: block.x + BlockLibraryManager.instance.libraries[block.library].BlockMoulds[block.nameID].size.width + 1,
                            y1: block.y,
                            y2: block.y + BlockLibraryManager.instance.libraries[block.library].BlockMoulds[block.nameID].size.height + 1
                        });
                    } else if (block.library == thisLibrary.nameID && block.nameID in thisLibrary.BlockMoulds) {
                        CodeManager.instance.graph.blocks[numI] = new Block(numI, block.x, block.y, thisLibrary.BlockMoulds[block.nameID]);
                        CodeManager.instance.blockCoords[numI] = ({
                            x1: block.x,
                            x2: block.x + thisLibrary.BlockMoulds[block.nameID].size.width + 1,
                            y1: block.y,
                            y2: block.y + thisLibrary.BlockMoulds[block.nameID].size.height + 1
                        });
                    }
                    console.log(CodeManager.instance.graph.blocks, block);
                    CodeManager.instance.graph.blocks[numI].logicImports = block.logicImports;
                    CodeManager.instance.graph.blocks[numI].logicExports = block.logicExports;
                    CodeManager.instance.graph.blocks[numI].dataImports = block.dataImports;
                    CodeManager.instance.graph.blocks[numI].dataExports = block.dataExports;
                    inputBuffer[0][numI] = block.input;
                }
                return true;
            }

            function obj2Blib(obj) {
                thisLibrary.nameID = obj.Blib.nameID;
                thisLibrary.color = obj.Blib.color;
                for (let i in obj.Blib.moulds) {
                    let index = parseInt(i);
                    thisLibrary.addNewMould(index);
                    thisLibrary.BlockMoulds[index].codeManager = new CodeManager();
                    console.log(obj.Blib.moulds[i]);
                    console.log(thisLibrary.BlockMoulds[index]);
                    thisLibrary.BlockMoulds[index].nameID = obj.Blib.moulds[i].nameID;
                    thisLibrary.BlockMoulds[index].Tnames = obj.Blib.moulds[i].Tnames;
                    thisLibrary.BlockMoulds[index].generalType = obj.Blib.moulds[i].generalType;
                    thisLibrary.BlockMoulds[index].type = obj.Blib.moulds[i].type;
                    thisLibrary.BlockMoulds[index].lib = obj.Blib.moulds[i].lib;
                    thisLibrary.BlockMoulds[index].size = obj.Blib.moulds[i].size;
                    thisLibrary.BlockMoulds[index].logicImportNum = obj.Blib.moulds[i].logicImportNum;
                    thisLibrary.BlockMoulds[index].logicExportNum = obj.Blib.moulds[i].logicExportNum;
                    thisLibrary.BlockMoulds[index].dataImportNum = obj.Blib.moulds[i].dataImportNum;
                    thisLibrary.BlockMoulds[index].dataExportNum = obj.Blib.moulds[i].dataExportNum;
                    thisLibrary.BlockMoulds[index].codeManager.type = obj.Blib.moulds[i].codeManager.type;
                    thisLibrary.BlockMoulds[index].codeManager.inputVariableNames = obj.Blib.moulds[i].codeManager.inputVariableNames;
                    thisLibrary.BlockMoulds[index].codeManager.outputVariableNames = obj.Blib.moulds[i].codeManager.outputVariableNames;
                    thisLibrary.BlockMoulds[index].codeManager.outputPort = obj.Blib.moulds[i].codeManager.outputPort;
                    thisLibrary.BlockMoulds[index].codeManager.graph.emptyIndex = obj.Blib.moulds[i].codeManager.graph.emptyIndex;
                    thisLibrary.BlockMoulds[index].codeManager.graph.size = obj.Blib.moulds[i].codeManager.graph.size;
                    LanguageManager.addPhrase(thisLibrary.nameID + "_" + thisLibrary.BlockMoulds[index].nameID, thisLibrary.BlockMoulds[index].Tnames);
                    inputBuffer[index] = {};
                }
                for (let i in obj.Blib.moulds) {
                    let index = parseInt(i);
                    for (let j in obj.Blib.moulds[i].codeManager.graph.blocks) {
                        let numI = parseInt(j);
                        let block = obj.Blib.moulds[i].codeManager.graph.blocks[numI];
                        console.log(block.library);
                        console.log(BlockLibraryManager.instance.libraries, block.nameID);
                        if (block.library in BlockLibraryManager.instance.libraries && block.nameID in BlockLibraryManager.instance.libraries[block.library].BlockMoulds) {
                            thisLibrary.BlockMoulds[index].codeManager.graph.blocks[numI] = new Block(numI, block.x, block.y, BlockLibraryManager.instance.libraries[block.library].BlockMoulds[block.nameID]);
                            thisLibrary.BlockMoulds[index].codeManager.blockCoords[numI] = ({
                                x1: block.x,
                                x2: block.x + BlockLibraryManager.instance.libraries[block.library].BlockMoulds[block.nameID].size.width + 1,
                                y1: block.y,
                                y2: block.y + BlockLibraryManager.instance.libraries[block.library].BlockMoulds[block.nameID].size.height + 1
                            });
                        } else if (block.library == thisLibrary.nameID && block.nameID in thisLibrary.BlockMoulds) {
                            thisLibrary.BlockMoulds[index].codeManager.graph.blocks[numI] = new Block(numI, block.x, block.y, thisLibrary.BlockMoulds[block.nameID]);
                            thisLibrary.BlockMoulds[index].codeManager.blockCoords[numI] = ({
                                x1: block.x,
                                x2: block.x + thisLibrary.BlockMoulds[block.nameID].size.width + 1,
                                y1: block.y,
                                y2: block.y + thisLibrary.BlockMoulds[block.nameID].size.height + 1
                            });
                        }
                        console.log(block);
                        console.log(thisLibrary.BlockMoulds[index]);
                        thisLibrary.BlockMoulds[index].codeManager.graph.blocks[numI].logicImports = block.logicImports;
                        thisLibrary.BlockMoulds[index].codeManager.graph.blocks[numI].logicExports = block.logicExports;
                        thisLibrary.BlockMoulds[index].codeManager.graph.blocks[numI].dataImports = block.dataImports;
                        thisLibrary.BlockMoulds[index].codeManager.graph.blocks[numI].dataExports = block.dataExports;
                        inputBuffer[index][numI] = block.input;
                    }
                }

            }

            fileName = res.fileName;
            mouldNum = res.mouldNum;
            console.log("Open file: ", fileName);
            fileNameInput.setAttribute("value", fileName);

            obj2Blib(res);
            obj2graph(res);

            changeCodeGraph(0);

            renderCodeGraph();

            for (let i in CodeManager.instance.graph.blocks) {
                let numI = parseInt(i);
                if (CodeManager.instance.graph.blocks[numI].blockMould.type == "input" || CodeManager.instance.graph.blocks[numI].blockMould.type == "assign")
                    document.getElementById("b" + numI).lastChild.firstChild.value = res.graph.blocks[numI].input;
            }

            console.log(thisLibrary.BlockMoulds);

            for (let i in thisLibrary.BlockMoulds) {
                let div = document.createElement("div");
                div.classList.add("BLibMouldsContent");
                div.classList.add("contentHover");
                let p = document.createElement("p");
                p.id = "userdefmould_" + thisLibrary.BlockMoulds[i].nameID;
                p.innerText = thisLibrary.BlockMoulds[i].Tnames[LanguageManager.currentLanguage];

                let thisMouldNum = thisLibrary.BlockMoulds[i].nameID;
                div.onmouseup = (event) => {
                    if (event.button == 2) {
                        console.log("delete mould " + thisMouldNum);
                        BLibMouldsContainer.removeChild(div);
                        delBlockMouldBlocks(thisMouldNum);
                        delete thisLibrary[thisMouldNum];
                    } else {
                        changeCodeGraph(thisMouldNum);
                        console.log(thisMouldNum, event.button);
                    }
                }

                div.draggable = true;

                div.ondragstart = () => {
                    console.log("2");
                    dragType = "mould";
                    dragDivArea.classList.remove("notDisplay");
                    dragDivArea.classList.add("display");
                    chosedBlockMould = thisLibrary.BlockMoulds[thisMouldNum];
                };
                div.ondragend = () => {
                    console.log("2");
                    dragDivArea.classList.remove("display");
                    dragDivArea.classList.add("notDisplay");
                    shadowBlock.classList.remove("display");
                    shadowBlock.classList.add("notDisplay");
                    shadowActivated = false;
                }
                div.appendChild(p);

                BLibMouldsContainer.appendChild(div);
            }
        }
    };
    input.click();
}

window.saveFileClicked = () => {
    inputBuffer[currentCodeGraph] = {};
    if (currentCodeGraph == 0) {
        for (let i in CodeManager.instance.graph.blocks) {
            let block = CodeManager.instance.graph.blocks[i];
            if (block.blockMould.type == "input" || block.blockMould.type == "assign")
                inputBuffer[currentCodeGraph][i] = document.getElementById("b" + i).lastChild.firstChild.value;
        }
    } else {
        for (let i in thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks) {
            let block = thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[i];
            if (block.blockMould.type == "input" || block.blockMould.type == "assign")
                inputBuffer[currentCodeGraph][i] = document.getElementById("b" + i).lastChild.firstChild.value;
        }
    }

    function graph2obj() {
        let graph = { blocks: {}, emptyIndex: CodeManager.instance.graph.emptyIndex, size: CodeManager.instance.graph.size };
        for (let i in CodeManager.instance.graph.blocks) {
            let block = CodeManager.instance.graph.blocks[i];
            graph.blocks[i] = {
                nameID: block.blockMould.nameID,
                library: block.blockMould.lib == thisLibrary.nameID ? fileName : block.blockMould.lib,
                index: block.index,
                x: block.x,
                y: block.y,
                logicImports: block.logicImports,
                logicExports: block.logicExports,
                dataImports: block.dataImports,
                dataExports: block.dataExports
            }
            if (block.blockMould.type == "input" || block.blockMould.type == "assign")
                graph.blocks[i]["input"] = inputBuffer[0][i];
            console.log(block.blockMould.type, inputBuffer);
            console.log(graph.blocks[i]);
        }
        return graph;
    }

    function Blib2obj() {
        let Blib = { nameID: fileName, color: thisLibrary.color, moulds: {} };
        for (let i in thisLibrary.BlockMoulds) {
            Blib.moulds[i] = {
                nameID: thisLibrary.BlockMoulds[i].nameID,
                Tnames: thisLibrary.BlockMoulds[i].Tnames,
                generalType: thisLibrary.BlockMoulds[i].generalType,
                type: thisLibrary.BlockMoulds[i].type,
                lib: fileName,
                size: thisLibrary.BlockMoulds[i].size,
                logicImportNum: thisLibrary.BlockMoulds[i].logicImportNum,
                logicExportNum: thisLibrary.BlockMoulds[i].logicExportNum,
                dataImportNum: thisLibrary.BlockMoulds[i].dataImportNum,
                dataExportNum: thisLibrary.BlockMoulds[i].dataExportNum,
                codeManager: {
                    type: thisLibrary.BlockMoulds[i].codeManager.type,
                    inputVariableNames: thisLibrary.BlockMoulds[i].codeManager.inputVariableNames,
                    outputVariableNames: thisLibrary.BlockMoulds[i].codeManager.outputVariableNames,
                    outputPort: thisLibrary.BlockMoulds[i].codeManager.outputPort,
                    graph: {
                        blocks: {},
                        emptyIndex: thisLibrary.BlockMoulds[i].codeManager.graph.emptyIndex,
                        size: thisLibrary.BlockMoulds[i].codeManager.graph.size
                    }
                }
            };
            for (let j in thisLibrary.BlockMoulds[i].codeManager.graph.blocks) {
                let block = thisLibrary.BlockMoulds[i].codeManager.graph.blocks[j];
                console.log(block);
                Blib.moulds[i].codeManager.graph.blocks[j] = {
                    nameID: block.blockMould.nameID,
                    library: block.blockMould.lib,
                    index: block.index,
                    x: block.x,
                    y: block.y,
                    logicImports: block.logicImports,
                    logicExports: block.logicExports,
                    dataImports: block.dataImports,
                    dataExports: block.dataExports
                }
                if (block.blockMould.type == "input" || block.blockMould.type == "assign")
                    Blib.moulds[i].codeManager.graph.blocks[j]["input"] = inputBuffer[i][j];
            }
        }
        return Blib;
    }

    let strJson = {};
    let currentDate = new Date();
    let datestr = "" + currentDate.getUTCFullYear() + "-" + currentDate.getUTCMonth() + "-" + currentDate.getUTCDate() + "-" + currentDate.getUTCHours() + "-" + currentDate.getUTCMinutes() + "-" + currentDate.getUTCSeconds();
    fileName = fileNameInput.value;
    strJson["fileName"] = fileName;
    strJson["date"] = datestr;
    strJson["mouldNum"] = mouldNum;
    strJson["graph"] = graph2obj();
    strJson["Blib"] = Blib2obj();
    FileOperator.saveFile(fileName + ".cjade", JSON.stringify(strJson));
}

window.changeTheme = () => {
    switch (currentTheme) {
        case "light":
            cssLink.href = "./css/theme/dark.css";
            currentTheme = "dark";
            sel_dark.classList.remove("notDisplay");
            sel_dark.classList.add("display");
            sel_light.classList.remove("display");
            sel_light.classList.add("notDisplay");
            break;
        case "dark":
            cssLink.href = "./css/theme/light.css";
            currentTheme = "light";
            sel_light.classList.remove("notDisplay");
            sel_light.classList.add("display");
            sel_dark.classList.remove("display");
            sel_dark.classList.add("notDisplay");
            break;
    }
}

window.changeLanguage = () => {
    LanguageManager.changeLanguage(LanguageManager.currentLanguage == "English" ? "Chinese" : "English");
    pstatus.innerText = LanguageManager.getPhrase("l_i_s_normal");
    infoContainer.style.backgroundColor = "var(--thirdColor)";
}

window.dragAreaDragDetected = (event) => {
    event.preventDefault();
    if (currentCodeGraph == 0) {
        if (shadowActivated == false) {
            shadowBlock.classList.remove("notDisplay");
            shadowBlock.classList.add("display");
            if (dragType == "mould") {
                shadowBlock.style.width = (chosedBlockMould.size.width + 1) * 50 + "px";
                shadowBlock.style.height = (chosedBlockMould.size.height + 1) * 50 + "px";
            } else {
                shadowBlock.style.width = (CodeManager.instance.graph.blocks[chosedBlockIndex].blockMould.size.width + 1) * 50 + "px";
                shadowBlock.style.height = (CodeManager.instance.graph.blocks[chosedBlockIndex].blockMould.size.height + 1) * 50 + "px";
            }
            shadowActivated = true;
        }
        let calC = { x: -1, y: -1 };
        if (dragType == "mould")
            calC = CodeManager.instance.calCoor(
                px2grid(event.offsetX) - Math.round(chosedBlockMould.size.width / 2) - 1,
                px2grid(event.offsetY) - Math.round(chosedBlockMould.size.height / 2) - 1,
                chosedBlockMould, canvasSize);
        else
            calC = CodeManager.instance.calCoor(
                px2grid(event.offsetX) - Math.round(CodeManager.instance.graph.blocks[chosedBlockIndex].blockMould.size.width / 2) - 1,
                px2grid(event.offsetY) - Math.round(CodeManager.instance.graph.blocks[chosedBlockIndex].blockMould.size.height / 2) - 1,
                CodeManager.instance.graph.blocks[chosedBlockIndex].blockMould, canvasSize, chosedBlockIndex);
        resX = calC.x;
        resY = calC.y;
        shadowBlock.style.left = resX * 50 + 25 + "px";
        shadowBlock.style.top = resY * 50 + 25 + "px";
    } else {
        if (shadowActivated == false) {
            shadowBlock.classList.remove("notDisplay");
            shadowBlock.classList.add("display");
            if (dragType == "mould") {
                shadowBlock.style.width = (chosedBlockMould.size.width + 1) * 50 + "px";
                shadowBlock.style.height = (chosedBlockMould.size.height + 1) * 50 + "px";
            } else {
                shadowBlock.style.width = (thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[chosedBlockIndex].blockMould.size.width + 1) * 50 + "px";
                shadowBlock.style.height = (thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[chosedBlockIndex].blockMould.size.height + 1) * 50 + "px";
            }
            shadowActivated = true;
        }
        let calC = { x: -1, y: -1 };
        if (dragType == "mould")
            calC = thisLibrary.BlockMoulds[currentCodeGraph].codeManager.calCoor(
                px2grid(event.offsetX) - Math.round(chosedBlockMould.size.width / 2) - 1,
                px2grid(event.offsetY) - Math.round(chosedBlockMould.size.height / 2) - 1,
                chosedBlockMould, canvasSize);
        else
            calC = thisLibrary.BlockMoulds[currentCodeGraph].codeManager.calCoor(
                px2grid(event.offsetX) - Math.round(thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[chosedBlockIndex].blockMould.size.width / 2) - 1,
                px2grid(event.offsetY) - Math.round(thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[chosedBlockIndex].blockMould.size.height / 2) - 1,
                thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[chosedBlockIndex].blockMould, canvasSize, chosedBlockIndex);
        resX = calC.x;
        resY = calC.y;
        shadowBlock.style.left = resX * 50 + 25 + "px";
        shadowBlock.style.top = resY * 50 + 25 + "px";
    }
}

window.dragAreaDropDetected = (event) => {
    if (currentCodeGraph == 0) {
        if (dragType == "mould") {
            let newIndex = CodeManager.instance.addBlock(chosedBlockMould, resX, resY);
            blockArea.appendChild(renderBlock(newIndex));
            pblocks.innerText = CodeManager.instance.graph.size;
        } else {
            let tmpblock = document.getElementById("b" + chosedBlockIndex);
            CodeManager.instance.graph.blocks[chosedBlockIndex].x = resX;
            CodeManager.instance.graph.blocks[chosedBlockIndex].y = resY;
            tmpblock.style.left = resX * 50 + 25 + "px";
            tmpblock.style.top = resY * 50 + 25 + "px";
            tmpblock.style.zIndex = 5;
            CodeManager.instance.blockCoords[chosedBlockIndex] = {
                x1: resX,
                x2: resX + CodeManager.instance.graph.blocks[chosedBlockIndex].blockMould.size.width + 1,
                y1: resY,
                y2: resY + CodeManager.instance.graph.blocks[chosedBlockIndex].blockMould.size.height + 1
            };
            for (let i = 0; i < CodeManager.instance.graph.blocks[chosedBlockIndex].blockMould.logicImportNum; i++) {
                for (let j = 0; j < CodeManager.instance.graph.blocks[chosedBlockIndex].logicImports[i].length; j++) {
                    let link = document.getElementById("l" + CodeManager.instance.graph.blocks[chosedBlockIndex].logicImports[i][j] +
                        "_" + CodeManager.instance.graph.blocks[CodeManager.instance.graph.blocks[chosedBlockIndex].logicImports[i][j]].searchLogicExport(chosedBlockIndex) +
                        "_" + chosedBlockIndex + "_" + i + "_" + "logic");
                    console.log("l" + CodeManager.instance.graph.blocks[chosedBlockIndex].logicImports[i][j] +
                        "_" + CodeManager.instance.graph.blocks[CodeManager.instance.graph.blocks[chosedBlockIndex].logicImports[i][j]].searchLogicExport(chosedBlockIndex) +
                        "_" + chosedBlockIndex + "_" + i + "_" + "logic");
                    blockArea.removeChild(link);
                    renderLink(CodeManager.instance.graph.blocks[chosedBlockIndex].logicImports[i][j],
                        CodeManager.instance.graph.blocks[CodeManager.instance.graph.blocks[chosedBlockIndex].logicImports[i][j]].searchLogicExport(chosedBlockIndex),
                        chosedBlockIndex, i, "logic");
                }
            }
            for (let i = 0; i < CodeManager.instance.graph.blocks[chosedBlockIndex].blockMould.logicExportNum; i++) {
                for (let j = 0; j < CodeManager.instance.graph.blocks[chosedBlockIndex].logicExports[i].length; j++) {
                    let link = document.getElementById("l" + chosedBlockIndex + "_" + i +
                        "_" + CodeManager.instance.graph.blocks[chosedBlockIndex].logicExports[i][j] +
                        "_" + CodeManager.instance.graph.blocks[CodeManager.instance.graph.blocks[chosedBlockIndex].logicExports[i][j]].searchLogicImport(chosedBlockIndex) +
                        "_" + "logic");
                    console.log("l" + chosedBlockIndex + "_" + i +
                        "_" + CodeManager.instance.graph.blocks[chosedBlockIndex].logicExports[i][j] +
                        "_" + CodeManager.instance.graph.blocks[CodeManager.instance.graph.blocks[chosedBlockIndex].logicExports[i][j]].searchLogicImport(chosedBlockIndex) +
                        "_" + "logic");
                    blockArea.removeChild(link);
                    renderLink(chosedBlockIndex, i, CodeManager.instance.graph.blocks[chosedBlockIndex].logicExports[i][j],
                        CodeManager.instance.graph.blocks[CodeManager.instance.graph.blocks[chosedBlockIndex].logicExports[i][j]].searchLogicImport(chosedBlockIndex), "logic");
                }
            }
            for (let i = 0; i < CodeManager.instance.graph.blocks[chosedBlockIndex].blockMould.dataImportNum; i++) {
                if (CodeManager.instance.graph.blocks[chosedBlockIndex].dataImports[i] == -1)
                    continue;
                let link = document.getElementById("l" + CodeManager.instance.graph.blocks[chosedBlockIndex].dataImports[i] +
                    "_" + CodeManager.instance.graph.blocks[CodeManager.instance.graph.blocks[chosedBlockIndex].dataImports[i]].searchDataExport(chosedBlockIndex) +
                    "_" + chosedBlockIndex + "_" + i + "_" + "data");
                blockArea.removeChild(link);
                renderLink(CodeManager.instance.graph.blocks[chosedBlockIndex].dataImports[i],
                    CodeManager.instance.graph.blocks[CodeManager.instance.graph.blocks[chosedBlockIndex].dataImports[i]].searchDataExport(chosedBlockIndex),
                    chosedBlockIndex, i, "data");
            }
            for (let i = 0; i < CodeManager.instance.graph.blocks[chosedBlockIndex].blockMould.dataExportNum; i++) {
                for (let j = 0; j < CodeManager.instance.graph.blocks[chosedBlockIndex].dataExports[i].length; j++) {
                    let link = document.getElementById("l" + chosedBlockIndex + "_" + i +
                        "_" + CodeManager.instance.graph.blocks[chosedBlockIndex].dataExports[i][j] +
                        "_" + CodeManager.instance.graph.blocks[CodeManager.instance.graph.blocks[chosedBlockIndex].dataExports[i][j]].searchDataImport(chosedBlockIndex) +
                        "_" + "data");
                    blockArea.removeChild(link);
                    renderLink(chosedBlockIndex, i, CodeManager.instance.graph.blocks[chosedBlockIndex].dataExports[i][j],
                        CodeManager.instance.graph.blocks[CodeManager.instance.graph.blocks[chosedBlockIndex].dataExports[i][j]].searchDataImport(chosedBlockIndex), "data");
                }
            }
        }
        dragDivArea.classList.remove("display");
        dragDivArea.classList.add("notDisplay");
        shadowBlock.classList.remove("display");
        shadowBlock.classList.add("notDisplay");
        shadowActivated = false;
    } else {
        if (dragType == "mould") {
            let newIndex = thisLibrary.BlockMoulds[currentCodeGraph].codeManager.addBlock(chosedBlockMould, resX, resY);
            blockArea.appendChild(renderBlock(newIndex));
            pblocks.innerText = thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.size;
        } else {
            let tmpblock = document.getElementById("b" + chosedBlockIndex);
            thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[chosedBlockIndex].x = resX;
            thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[chosedBlockIndex].y = resY;
            tmpblock.style.left = resX * 50 + 25 + "px";
            tmpblock.style.top = resY * 50 + 25 + "px";
            tmpblock.style.zIndex = 5;
            thisLibrary.BlockMoulds[currentCodeGraph].codeManager.blockCoords[chosedBlockIndex] = {
                x1: resX,
                x2: resX + thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[chosedBlockIndex].blockMould.size.width + 1,
                y1: resY,
                y2: resY + thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[chosedBlockIndex].blockMould.size.height + 1
            };
            for (let i = 0; i < thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[chosedBlockIndex].blockMould.logicImportNum; i++) {
                for (let j = 0; j < thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[chosedBlockIndex].logicImports[i].length; j++) {
                    let link = document.getElementById("l" + thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[chosedBlockIndex].logicImports[i][j] +
                        "_" + thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[chosedBlockIndex].logicImports[i][j]].searchLogicExport(chosedBlockIndex) +
                        "_" + chosedBlockIndex + "_" + i + "_" + "logic");
                    blockArea.removeChild(link);
                    renderLink(thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[chosedBlockIndex].logicImports[i][j],
                        thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[chosedBlockIndex].logicImports[i][j]].searchLogicExport(chosedBlockIndex),
                        chosedBlockIndex, i, "logic");
                }
            }
            for (let i = 0; i < thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[chosedBlockIndex].blockMould.logicExportNum; i++) {
                for (let j = 0; j < thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[chosedBlockIndex].logicExports[i].length; j++) {
                    let link = document.getElementById("l" + chosedBlockIndex + "_" + i +
                        "_" + thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[chosedBlockIndex].logicExports[i][j] +
                        "_" + thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[chosedBlockIndex].logicExports[i][j]].searchLogicImport(chosedBlockIndex) +
                        "_" + "logic");
                    blockArea.removeChild(link);
                    renderLink(chosedBlockIndex, i, thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[chosedBlockIndex].logicExports[i][j],
                        thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[chosedBlockIndex].logicExports[i][j]].searchLogicImport(chosedBlockIndex), "logic");
                }
            }
            for (let i = 0; i < thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[chosedBlockIndex].blockMould.dataImportNum; i++) {
                if (thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[chosedBlockIndex].dataImports[i] == -1)
                    continue;
                let link = document.getElementById("l" + thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[chosedBlockIndex].dataImports[i] +
                    "_" + thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[chosedBlockIndex].dataImports[i]].searchDataExport(chosedBlockIndex) +
                    "_" + chosedBlockIndex + "_" + i + "_" + "data");
                blockArea.removeChild(link);
                renderLink(thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[chosedBlockIndex].dataImports[i],
                    thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[chosedBlockIndex].dataImports[i]].searchDataExport(chosedBlockIndex),
                    chosedBlockIndex, i, "data");
            }
            for (let i = 0; i < thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[chosedBlockIndex].blockMould.dataExportNum; i++) {
                for (let j = 0; j < thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[chosedBlockIndex].dataExports[i].length; j++) {
                    let link = document.getElementById("l" + chosedBlockIndex + "_" + i +
                        "_" + thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[chosedBlockIndex].dataExports[i][j] +
                        "_" + thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[chosedBlockIndex].dataExports[i][j]].searchDataImport(chosedBlockIndex) +
                        "_" + "data");
                    blockArea.removeChild(link);
                    renderLink(chosedBlockIndex, i, thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[chosedBlockIndex].dataExports[i][j],
                        thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[thisLibrary.BlockMoulds[currentCodeGraph].codeManager.graph.blocks[chosedBlockIndex].dataExports[i][j]].searchDataImport(chosedBlockIndex), "data");
                }
            }
        }
        dragDivArea.classList.remove("display");
        dragDivArea.classList.add("notDisplay");
        shadowBlock.classList.remove("display");
        shadowBlock.classList.add("notDisplay");
        shadowActivated = false;
    }
}

window.mainFlowClicked = () => {
    changeCodeGraph(0);
}

window.addMould = () => {
    let div = document.createElement("div");
    div.classList.add("BLibMouldsContent");
    div.classList.add("contentHover");
    let p = document.createElement("p");
    p.id = "userdefmould_" + mouldNum;
    p.innerText = "New Mould " + mouldNum;
    let thisMouldNum = mouldNum;
    div.onmouseup = (event) => {
        if (event.button == 2) {
            if (thisMouldNum == currentCodeGraph)
                changeCodeGraph(0);
            console.log("delete mould " + thisMouldNum);
            BLibMouldsContainer.removeChild(div);
            delBlockMouldBlocks(thisMouldNum);
            delete thisLibrary.BlockMoulds[thisMouldNum];
            console.log(thisLibrary.BlockMoulds);
        } else {
            changeCodeGraph(thisMouldNum);
            console.log(thisMouldNum, event.button);
        }
    }

    div.draggable = true;

    div.ondragstart = () => {
        console.log("2");
        dragType = "mould";
        dragDivArea.classList.remove("notDisplay");
        dragDivArea.classList.add("display");
        chosedBlockMould = thisLibrary.BlockMoulds[thisMouldNum];
    };
    div.ondragend = () => {
        console.log("2");
        dragDivArea.classList.remove("display");
        dragDivArea.classList.add("notDisplay");
        shadowBlock.classList.remove("display");
        shadowBlock.classList.add("notDisplay");
        shadowActivated = false;
    }
    div.appendChild(p);

    BLibMouldsContainer.appendChild(div);
    inputBuffer[thisMouldNum] = {};
    thisLibrary.addNewMould(thisMouldNum);
    thisLibrary.BlockMoulds[thisMouldNum].codeManager = new CodeManager();
    mouldNum += 1;
}

window.rtButtonClicked = (event) => {
    if (currentCodeGraph == 0) {
        function codeEncoder() {
            let blocks = {},
                inputs = {},
                Blibrary = {};
            Blibrary[thisLibrary.nameID] = { nameID: thisLibrary.nameID, moulds: {} };
            inputs[0] = {};
            for (let i in CodeManager.instance.graph.blocks) {
                blocks[i] = {};
                blocks[i].index = CodeManager.instance.graph.blocks[i].index;
                blocks[i].nameID = CodeManager.instance.graph.blocks[i].blockMould.nameID;
                blocks[i].lib = CodeManager.instance.graph.blocks[i].blockMould.lib;
                blocks[i].generalType = CodeManager.instance.graph.blocks[i].blockMould.generalType;
                blocks[i].type = CodeManager.instance.graph.blocks[i].blockMould.type;
                blocks[i].logicImports = CodeManager.instance.graph.blocks[i].logicImports;
                blocks[i].logicExports = CodeManager.instance.graph.blocks[i].logicExports;
                blocks[i].dataImports = CodeManager.instance.graph.blocks[i].dataImports;
                blocks[i].dataExports = CodeManager.instance.graph.blocks[i].dataExports;
                blocks[i].forward = CodeManager.instance.graph.blocks[i].blockMould.forward.toString();
                if (CodeManager.instance.graph.blocks[i].blockMould.type == "assign" || CodeManager.instance.graph.blocks[i].blockMould.type == "input") {
                    let block = document.getElementById("b" + i);
                    inputs[0][i] = block.lastChild.firstChild.value;
                }
                if (CodeManager.instance.graph.blocks[i].blockMould.type == "output")
                    document.getElementById("out" + i).innerText = "";
            }
            inputs[thisLibrary.nameID] = {};
            for (let i in thisLibrary.BlockMoulds) {
                Blibrary[thisLibrary.nameID].moulds[i] = {};
                Blibrary[thisLibrary.nameID].moulds[i].nameID = thisLibrary.BlockMoulds[i].nameID;
                Blibrary[thisLibrary.nameID].moulds[i].generalType = thisLibrary.BlockMoulds[i].generalType;
                Blibrary[thisLibrary.nameID].moulds[i].type = thisLibrary.BlockMoulds[i].type;
                console.log(thisLibrary.BlockMoulds[i].type);
                Blibrary[thisLibrary.nameID].moulds[i].lib = thisLibrary.BlockMoulds[i].lib;
                Blibrary[thisLibrary.nameID].moulds[i].inputVariableNames = thisLibrary.BlockMoulds[i].codeManager.inputVariableNames;
                Blibrary[thisLibrary.nameID].moulds[i].outputVariableNames = thisLibrary.BlockMoulds[i].codeManager.outputVariableNames;
                Blibrary[thisLibrary.nameID].moulds[i].blocks = {};
                console.log(Blibrary[thisLibrary.nameID].moulds[i].outputVariableNames);
                inputs[thisLibrary.nameID][i] = {};
                for (let j in thisLibrary.BlockMoulds[i].codeManager.graph.blocks) {
                    Blibrary[thisLibrary.nameID].moulds[i].blocks[j] = {};
                    Blibrary[thisLibrary.nameID].moulds[i].blocks[j].index = thisLibrary.BlockMoulds[i].codeManager.graph.blocks[j].index;
                    Blibrary[thisLibrary.nameID].moulds[i].blocks[j].nameID = thisLibrary.BlockMoulds[i].codeManager.graph.blocks[j].blockMould.nameID;
                    Blibrary[thisLibrary.nameID].moulds[i].blocks[j].lib = thisLibrary.BlockMoulds[i].codeManager.graph.blocks[j].blockMould.lib;
                    Blibrary[thisLibrary.nameID].moulds[i].blocks[j].generalType = thisLibrary.BlockMoulds[i].codeManager.graph.blocks[j].blockMould.generalType;
                    Blibrary[thisLibrary.nameID].moulds[i].blocks[j].type = thisLibrary.BlockMoulds[i].codeManager.graph.blocks[j].blockMould.type;
                    Blibrary[thisLibrary.nameID].moulds[i].blocks[j].logicImports = thisLibrary.BlockMoulds[i].codeManager.graph.blocks[j].logicImports;
                    Blibrary[thisLibrary.nameID].moulds[i].blocks[j].logicExports = thisLibrary.BlockMoulds[i].codeManager.graph.blocks[j].logicExports;
                    Blibrary[thisLibrary.nameID].moulds[i].blocks[j].dataImports = thisLibrary.BlockMoulds[i].codeManager.graph.blocks[j].dataImports;
                    Blibrary[thisLibrary.nameID].moulds[i].blocks[j].dataExports = thisLibrary.BlockMoulds[i].codeManager.graph.blocks[j].dataExports;
                    Blibrary[thisLibrary.nameID].moulds[i].blocks[j].forward = thisLibrary.BlockMoulds[i].codeManager.graph.blocks[j].blockMould.forward.toString();
                    if (thisLibrary.BlockMoulds[i].codeManager.graph.blocks[j].blockMould.type == "assign" || thisLibrary.BlockMoulds[i].codeManager.graph.blocks[j].blockMould.type == "input")
                        inputs[thisLibrary.nameID][i][j] = inputBuffer[i][j];
                }
            }
            for (let currentLibName in loadedLibraries) {
                let currentLib = loadedLibraries[currentLibName];
                Blibrary[currentLib.nameID] = { nameID: currentLib.nameID, moulds: {} };
                inputs[currentLib.nameID] = {};
                for (let i in currentLib.BlockMoulds) {
                    Blibrary[currentLib.nameID].moulds[i] = {};
                    Blibrary[currentLib.nameID].moulds[i].nameID = currentLib.BlockMoulds[i].nameID;
                    Blibrary[currentLib.nameID].moulds[i].generalType = currentLib.BlockMoulds[i].generalType;
                    Blibrary[currentLib.nameID].moulds[i].type = currentLib.BlockMoulds[i].type;
                    console.log(currentLib.BlockMoulds[i].type);
                    Blibrary[currentLib.nameID].moulds[i].lib = currentLib.BlockMoulds[i].lib;
                    Blibrary[currentLib.nameID].moulds[i].inputVariableNames = currentLib.BlockMoulds[i].codeManager.inputVariableNames;
                    Blibrary[currentLib.nameID].moulds[i].outputVariableNames = currentLib.BlockMoulds[i].codeManager.outputVariableNames;
                    Blibrary[currentLib.nameID].moulds[i].blocks = {};
                    console.log(Blibrary[currentLib.nameID].moulds[i].outputVariableNames);
                    inputs[currentLib.nameID][i] = {};
                    for (let j in currentLib.BlockMoulds[i].codeManager.graph.blocks) {
                        Blibrary[currentLib.nameID].moulds[i].blocks[j] = {};
                        Blibrary[currentLib.nameID].moulds[i].blocks[j].index = currentLib.BlockMoulds[i].codeManager.graph.blocks[j].index;
                        Blibrary[currentLib.nameID].moulds[i].blocks[j].nameID = currentLib.BlockMoulds[i].codeManager.graph.blocks[j].blockMould.nameID;
                        Blibrary[currentLib.nameID].moulds[i].blocks[j].lib = currentLib.BlockMoulds[i].codeManager.graph.blocks[j].blockMould.lib;
                        Blibrary[currentLib.nameID].moulds[i].blocks[j].generalType = currentLib.BlockMoulds[i].codeManager.graph.blocks[j].blockMould.generalType;
                        Blibrary[currentLib.nameID].moulds[i].blocks[j].type = currentLib.BlockMoulds[i].codeManager.graph.blocks[j].blockMould.type;
                        Blibrary[currentLib.nameID].moulds[i].blocks[j].logicImports = currentLib.BlockMoulds[i].codeManager.graph.blocks[j].logicImports;
                        Blibrary[currentLib.nameID].moulds[i].blocks[j].logicExports = currentLib.BlockMoulds[i].codeManager.graph.blocks[j].logicExports;
                        Blibrary[currentLib.nameID].moulds[i].blocks[j].dataImports = currentLib.BlockMoulds[i].codeManager.graph.blocks[j].dataImports;
                        Blibrary[currentLib.nameID].moulds[i].blocks[j].dataExports = currentLib.BlockMoulds[i].codeManager.graph.blocks[j].dataExports;
                        Blibrary[currentLib.nameID].moulds[i].blocks[j].forward = currentLib.BlockMoulds[i].codeManager.graph.blocks[j].blockMould.forward.toString();
                        if (currentLib.BlockMoulds[i].codeManager.graph.blocks[j].blockMould.type == "assign" || currentLib.BlockMoulds[i].codeManager.graph.blocks[j].blockMould.type == "input")
                            inputs[currentLib.nameID][i][j] = newLibMem[currentLib.nameID][i][j];
                    }
                }
            }
            console.log(thisLibrary);
            console.log(Blibrary);
            return { blocks: blocks, inputs: inputs, Blibrary: Blibrary };
        }

        function runCodeInit() {
            console.log("start");
            pstatus.innerText = LanguageManager.getPhrase("l_i_s_busy");
            infoContainer.style.backgroundColor = "var(--busyColor)";
            img_runButton.setAttribute("src", "./res/svg/feather_error/square.svg");
            isCodeRunning = true;
            lockArea.classList.add("display");
            lockArea.classList.remove("notDisplay");
            for (let i in CodeManager.instance.graph.blocks) {
                if (CodeManager.instance.graph.blocks[i].blockMould.type == "assign" || CodeManager.instance.graph.blocks[i].blockMould.type == "input") {
                    let block = document.getElementById("b" + i);
                    block.lastChild.firstChild.classList.remove("inputBorder");
                    block.lastChild.firstChild.classList.add("inputTransBorder");
                }
            }
            worker = new Worker("./scripts/codeRunner.js", { type: 'module' });
            worker.postMessage(JSON.stringify(codeEncoder()));
            worker.onmessage = (e) => {
                switch (e.data.type) {
                    case "signal":
                        switch (e.data.data) {
                            case "End":
                                pstatus.innerText = LanguageManager.getPhrase("l_i_s_normal");
                                infoContainer.style.backgroundColor = "var(--thirdColor)";
                                runCodeEnd();
                                break;
                            case "Error":
                                pstatus.innerText = LanguageManager.getPhrase("l_i_s_errorat") + e.data.index;
                                infoContainer.style.backgroundColor = "var(--errorColor)";
                                runCodeEnd(false);
                                break;
                        }
                        break;
                    case "output":
                        console.log(e.data.data.context);
                        document.getElementById("out" + e.data.data.index).innerText = e.data.data.context;
                        break;
                }
            }
        }

        function runCodeEnd(isNormal = true) {
            console.log("end");
            worker.terminate();
            worker = undefined;
            if (isNormal) {
                pstatus.innerText = LanguageManager.getPhrase("l_i_s_normal");
                infoContainer.style.backgroundColor = "var(--thirdColor)";
            }
            img_runButton.setAttribute("src", "./res/svg/feather_cyan/play.svg");
            lockArea.classList.remove("display");
            lockArea.classList.add("notDisplay");
            for (let i in CodeManager.instance.graph.blocks) {
                if (CodeManager.instance.graph.blocks[i].blockMould.type == "assign" || CodeManager.instance.graph.blocks[i].blockMould.type == "input") {
                    let block = document.getElementById("b" + i);
                    block.lastChild.firstChild.classList.add("inputBorder");
                    block.lastChild.firstChild.classList.remove("inputTransBorder");
                }
            }
            isCodeRunning = false;
        }

        if (isCodeRunning == false)
            runCodeInit();
        else
            runCodeEnd();
    }
}

window.onresize = () => {
    canvasSize.width = Math.max(canvasSize.width, window.screen.availWidth);
    canvasSize.height = Math.max(canvasSize.height, window.screen.availHeight)
    canvasArea.style.width = canvasSize.width * 50 + "px";
    canvasArea.style.height = canvasSize.height * 50 + "px";
}

for (let blockLib in BlockLibraryManager.instance.libraries) {
    let div = document.createElement("div");
    div.classList.add("selectorElement");
    div.classList.add("contentHover");
    div.onclick = () => {
        if (blockLibDisplay == blockLib) {
            eraseBlockLibDisplay();
            opBlockElementSelector.style.top = "-180px";
            blockLibDisplay = "disabled";
            return;
        }
        blockLibDisplay = blockLib;
        eraseBlockLibDisplay();
        for (let blockMould in BlockLibraryManager.instance.libraries[blockLib].BlockMoulds) {
            let div2 = document.createElement("div");
            div2.classList.add("selectorElement");
            div2.classList.add("contentHover");
            div2.draggable = true;

            div2.ondragstart = () => {
                dragType = "mould";
                dragDivArea.classList.remove("notDisplay");
                dragDivArea.classList.add("display");
                chosedBlockMould = BlockLibraryManager.instance.libraries[blockLib].BlockMoulds[blockMould];
                console.log(chosedBlockMould);
            };
            div2.ondragend = () => {
                dragDivArea.classList.remove("display");
                dragDivArea.classList.add("notDisplay");
                shadowBlock.classList.remove("display");
                shadowBlock.classList.add("notDisplay");
                shadowActivated = false;
            }

            let p2 = document.createElement("p");
            p2.setAttribute("name", blockLib + "_" + blockMould);
            p2.innerText = LanguageManager.phrases[blockLib + "_" + blockMould][LanguageManager.currentLanguage];
            div2.appendChild(p2);
            opBlockElementSelector.appendChild(div2);
        }
        opBlockElementSelector.style.top = "95px";
        opBlockElementSelector.scrollTop = 0;
        return;
    };
    let p = document.createElement("p");
    p.setAttribute("name", blockLib);
    div.appendChild(p);
    opBlockSelector.appendChild(div);
}

canvasArea.style.width = canvasSize.width * 50 + "px";
canvasArea.style.height = canvasSize.height * 50 + "px";
playgroundContainer.scrollTop = (canvasSize.height * 50 - window.innerHeight) / 2;
playgroundContainer.scrollLeft = (canvasSize.width * 50 - window.innerWidth) / 2;
LanguageManager.changeLanguage(navigator.language == "zh-CN" ? "Chinese" : "English");
pstatus.innerText = LanguageManager.getPhrase("l_i_s_normal");
infoContainer.style.backgroundColor = "var(--thirdColor)";
fileNameInput.setAttribute("value", fileName);
console.log(navigatorType);