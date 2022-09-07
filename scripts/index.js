import BlockLibraryManager from "./core/BlockLibraryManager.js";
import CodeManager from "./core/codeManager.js";
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

let activated = "disabled";
let blockLibDisplay = "disabled";
let currentTheme = "light";
let chosedBlockMould = null;
let chosedBlockIndex = null;
let shadowActivated = false;
let dragType = "";
let canvasSize = { width: Math.max(px2grid(window.screen.availWidth * 2), 500), height: Math.max(px2grid(window.screen.availHeight * 2), 500) };
let resX, resY;
let port1 = {
    type: "none",
    blockIndex: -1,
    portIndex: -1
};

function renderLink(index1, port1, index2, port2, type) {
    let y1b = port1,
        y2b = port2;
    if (type == "data") {
        y1b += CodeManager.instance.graph.blocks[index1].blockMould.logicImportNum;
        y2b += CodeManager.instance.graph.blocks[index1].blockMould.logicExportNum;
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
        path.setAttribute("stroke-width", "5px")
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
    svg.onclick = (event) => {
        event.preventDefault();
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
            CodeManager.instance.delBlock(index);
            let tmpblock = document.getElementById("b" + index);
            blockArea.removeChild(tmpblock);
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
        port.style.left = "5px";
        port.style.top = i * 50 + 25 + 16 + "px";
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
                if (CodeManager.instance.isConnectionAvailable(port1.blockIndex, index, i)) {
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
        port.style.left = "5px";
        port.style.top = (CodeManager.instance.graph.blocks[index].blockMould.logicImportNum + i) * 50 + 25 + 18.5 + "px";
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
                if (CodeManager.instance.isConnectionAvailable(port1.blockIndex, index, i)) {
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
        port.style.right = "5px";
        port.style.top = i * 50 + 25 + 16 + "px";
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
                if (CodeManager.instance.isConnectionAvailable(index, port1.blockIndex, port1.portIndex)) {
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
        port.style.right = "7px";
        port.style.top = (CodeManager.instance.graph.blocks[index].blockMould.logicExportNum + i) * 50 + 25 + 18.5 + "px";
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
                if (CodeManager.instance.isConnectionAvailable(index, port1.blockIndex, port1.portIndex)) {
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
    let p = document.createElement("p");
    p.className = "blockp";
    p.setAttribute("name", block.blockMould.nameID);
    p.innerText = LanguageManager.phrases[block.blockMould.nameID][LanguageManager.currentLanguage];
    divblock.appendChild(p);
    div.appendChild(divblock);
    div.style.width = (block.blockMould.size.width + 1) * 50 + "px";
    div.style.height = (block.blockMould.size.height + 1) * 50 + "px";
    div.style.left = block.x * 50 + 25 + "px";
    div.style.top = block.y * 50 + 25 + "px";
    return div;
}

function renderGraph() {
    for (let htmlElement in blockArea.children) {
        if (htmlElement == 0)
            continue;
        blockArea.removeChild(blockArea.children[htmlElement]);
    }
    for (let block in CodeManager.instance.graph.blocks)
        blockArea.appendChild(renderBlock(block));
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
}

window.dragAreaDragDetected = (event) => {
    event.preventDefault();
    if (shadowActivated == false) {
        shadowBlock.classList.remove("notDisplay");
        shadowBlock.classList.add("display");
        shadowBlock.style.width = (chosedBlockMould.size.width + 1) * 50 + "px";
        shadowBlock.style.height = (chosedBlockMould.size.height + 1) * 50 + "px";
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
            px2grid(event.offsetX) - Math.round(chosedBlockMould.size.width / 2) - 1,
            px2grid(event.offsetY) - Math.round(chosedBlockMould.size.height / 2) - 1,
            chosedBlockMould, canvasSize, chosedBlockIndex);
    resX = calC.x;
    resY = calC.y;
    shadowBlock.style.left = resX * 50 + 25 + "px";
    shadowBlock.style.top = resY * 50 + 25 + "px";
}

window.dragAreaDropDetected = (event) => {
    if (dragType == "mould") {
        let newIndex = CodeManager.instance.addBlock(chosedBlockMould, resX, resY);
        blockArea.appendChild(renderBlock(newIndex));
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
LanguageManager.changeLanguage("English");