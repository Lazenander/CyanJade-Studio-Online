import BlockLibraryManager from "./BlockLibraryManager.js";
import Block from "./Block.js";
import Graph from "./Graph.js";
import CodeManager from "./codeManager.js";
import DataStream from "./DataStream.js";
import FileOperator from "./FileOperator.js";
import LanguageManager from "./language.js";
import px2grid from "./projector.js";

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
const img_runButton = document.getElementById("img_runButton");
const pstatus = document.getElementById("pstatus");
const pblocks = document.getElementById("pblocks");
const infoContainer = document.getElementById("infoContainer");
const fileNameInput = document.getElementById("fileNameInput");

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

function renderLink(index1, port1, index2, port2, type) {
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
}

function renderBlock(index) {
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
        } else {
            if (CodeManager.instance.graph.blocks[index].blockMould.type == "output") {
                var text = document.getElementById("out" + index).innerText;
                navigator.clipboard.writeText(text);
            }
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
            p.setAttribute("name", block.blockMould.nameID);
            p.innerText = LanguageManager.phrases[block.blockMould.nameID][LanguageManager.currentLanguage];
            divblock.appendChild(p);
            break;
    }
    div.appendChild(divblock);
    div.title = index + ": \"" + LanguageManager.phrases[block.blockMould.nameID]["English"] + "\"";
    div.style.width = (block.blockMould.size.width + 1) * 50 + "px";
    div.style.height = (block.blockMould.size.height + 1) * 50 + "px";
    div.style.left = block.x * 50 + 25 + "px";
    div.style.top = block.y * 50 + 25 + "px";
    return div;
}

function clearRender() {
    for (; blockArea.children.length > 1;)
        blockArea.removeChild(blockArea.children[1]);
}

function initCode() {
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
    fileNameInput.setAttribute("value", fileName);
    clearRender();
    CodeManager.instance.graph = new Graph();
    CodeManager.instance.blockCoords = {};
    pblocks.innerText = CodeManager.instance.graph.size;
}

function renderAll() {
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
        opSettingSelector.classList.remove("selectorDisappear");
        opSettingSelector.classList.add("selectorAppear");
        activated = "setting";
    }
}

window.newFileClicked = () => {
    initCode();
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
                CodeManager.instance.graph.size = obj.graph.size;
                pblocks.innerText = CodeManager.instance.graph.size;
                CodeManager.instance.graph.emptyIndex = obj.graph.emptyIndex;
                for (let i in obj.graph.blocks) {
                    let numI = parseInt(i);
                    let block = obj.graph.blocks[numI];
                    if (block.library in BlockLibraryManager.instance.libraries && block.nameID in BlockLibraryManager.instance.libraries[block.library].BlockMoulds) {
                        CodeManager.instance.graph.blocks[numI] = new Block(numI, block.x, block.y, BlockLibraryManager.instance.libraries[block.library].BlockMoulds[block.nameID]);
                        CodeManager.instance.blockCoords[numI] = ({
                            x1: block.x,
                            x2: block.x + BlockLibraryManager.instance.libraries[block.library].BlockMoulds[block.nameID].size.width + 1,
                            y1: block.y,
                            y2: block.y + BlockLibraryManager.instance.libraries[block.library].BlockMoulds[block.nameID].size.height + 1
                        });
                    } else {
                        initCode();
                        return false;
                    }
                    CodeManager.instance.graph.blocks[numI].logicImports = block.logicImports;
                    CodeManager.instance.graph.blocks[numI].logicExports = block.logicExports;
                    CodeManager.instance.graph.blocks[numI].dataImports = block.dataImports;
                    CodeManager.instance.graph.blocks[numI].dataExports = block.dataExports;
                }
                return true;
            }

            fileName = res.fileName;
            console.log("Open file: ", fileName);
            fileNameInput.setAttribute("value", fileName);

            obj2graph(res);

            renderAll();

            for (let i in CodeManager.instance.graph.blocks) {
                let numI = parseInt(i);
                if (CodeManager.instance.graph.blocks[numI].blockMould.type == "input" || CodeManager.instance.graph.blocks[numI].blockMould.type == "assign")
                    document.getElementById("b" + numI).lastChild.firstChild.value = res.graph.blocks[numI].input;
            }
        }
    };
    input.click();
}

window.saveFileClicked = () => {
    function graph2obj() {
        let graph = { blocks: {}, emptyIndex: CodeManager.instance.graph.emptyIndex, size: CodeManager.instance.graph.size };
        for (let i in CodeManager.instance.graph.blocks) {
            let block = CodeManager.instance.graph.blocks[i];
            graph.blocks[i] = {
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
            if (block.blockMould.type == "input" || block.blockMould.type == "assign") {
                graph.blocks[i]["input"] = document.getElementById("b" + i).lastChild.firstChild.value;
            }
        }
        return graph;
    }
    let strJson = {};
    let currentDate = new Date();
    let datestr = "" + currentDate.getUTCFullYear() + "-" + currentDate.getUTCMonth() + "-" + currentDate.getUTCDate() + "-" + currentDate.getUTCHours() + "-" + currentDate.getUTCMinutes() + "-" + currentDate.getUTCSeconds();
    fileName = fileNameInput.value;
    strJson["fileName"] = fileName;
    strJson["date"] = datestr;
    strJson["graph"] = graph2obj();
    FileOperator.saveFile(fileName + "-" + datestr + ".cjade", JSON.stringify(strJson));
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
    let calC = { x: -1, y: -1 }
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
}

window.dragAreaDropDetected = (event) => {
    console.log(100);
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

            // Desktop
            div2.ondragstart = () => {
                dragType = "mould";
                dragDivArea.classList.remove("notDisplay");
                dragDivArea.classList.add("display");
                chosedBlockMould = BlockLibraryManager.instance.libraries[blockLib].BlockMoulds[blockMould];
            };
            div2.ondragend = () => {
                dragDivArea.classList.remove("display");
                dragDivArea.classList.add("notDisplay");
                shadowBlock.classList.remove("display");
                shadowBlock.classList.add("notDisplay");
                shadowActivated = false;
            }
            div2.ontouchstart = (e) => {
                e.preventDefault();
                dragType = "mould";
                dragDivArea.classList.remove("notDisplay");
                dragDivArea.classList.add("display");
                console.log(2);
                chosedBlockMould = BlockLibraryManager.instance.libraries[blockLib].BlockMoulds[blockMould];
            };

            // mobile devices
            div2.ontouchmove = (e) => {
                let posX = Math.max(playgroundContainer.scrollLeft + e.pageX, 0);
                let posY = Math.max(playgroundContainer.scrollTop + e.pageY - 30, 0);
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
                let calC = { x: -1, y: -1 }
                if (dragType == "mould")
                    calC = CodeManager.instance.calCoor(
                        px2grid(posX) - Math.round(chosedBlockMould.size.width / 2) - 1,
                        px2grid(posY) - Math.round(chosedBlockMould.size.height / 2) - 1,
                        chosedBlockMould, canvasSize);
                else
                    calC = CodeManager.instance.calCoor(
                        px2grid(posX) - Math.round(CodeManager.instance.graph.blocks[chosedBlockIndex].blockMould.size.width / 2) - 1,
                        px2grid(posY) - Math.round(CodeManager.instance.graph.blocks[chosedBlockIndex].blockMould.size.height / 2) - 1,
                        CodeManager.instance.graph.blocks[chosedBlockIndex].blockMould, canvasSize, chosedBlockIndex);
                resX = calC.x;
                resY = calC.y;
                shadowBlock.style.left = resX * 50 + 25 + "px";
                shadowBlock.style.top = resY * 50 + 25 + "px";
                console.log(posX, posY);
            }
            div2.ontouchend = (e) => {
                e.preventDefault();
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
            }

            let p2 = document.createElement("p");
            p2.setAttribute("name", blockMould);
            p2.innerText = LanguageManager.phrases[blockMould][LanguageManager.currentLanguage];
            div2.appendChild(p2);
            opBlockElementSelector.appendChild(div2);
        }
        opBlockElementSelector.style.top = "95px";
        return;
    };
    let p = document.createElement("p");
    p.setAttribute("name", blockLib);
    div.appendChild(p);
    opBlockSelector.appendChild(div);
}

window.rtButtonClicked = (event) => {
    function codeEncoder() {
        let blocks = {},
            inputs = {};
        for (let i in CodeManager.instance.graph.blocks) {
            blocks[i] = {};
            blocks[i].index = CodeManager.instance.graph.blocks[i].index;
            blocks[i].generalType = CodeManager.instance.graph.blocks[i].blockMould.generalType;
            blocks[i].type = CodeManager.instance.graph.blocks[i].blockMould.type;
            blocks[i].logicImports = CodeManager.instance.graph.blocks[i].logicImports;
            blocks[i].logicExports = CodeManager.instance.graph.blocks[i].logicExports;
            blocks[i].dataImports = CodeManager.instance.graph.blocks[i].dataImports;
            blocks[i].dataExports = CodeManager.instance.graph.blocks[i].dataExports;
            blocks[i].forward = CodeManager.instance.graph.blocks[i].blockMould.forward.toString();
            if (CodeManager.instance.graph.blocks[i].blockMould.type == "assign" || CodeManager.instance.graph.blocks[i].blockMould.type == "input") {
                let block = document.getElementById("b" + i);
                inputs[i] = [block.lastChild.firstChild.value];
            }
            if (CodeManager.instance.graph.blocks[i].blockMould.type == "output")
                document.getElementById("out" + i).innerText = "";
        }
        return { blocks: blocks, inputs: inputs };
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

window.onresize = () => {
    canvasSize.width = Math.max(canvasSize.width, window.screen.availWidth);
    canvasSize.height = Math.max(canvasSize.height, window.screen.availHeight)
    canvasArea.style.width = canvasSize.width * 50 + "px";
    canvasArea.style.height = canvasSize.height * 50 + "px";
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