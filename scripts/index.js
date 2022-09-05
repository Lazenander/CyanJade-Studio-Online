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
        div.appendChild(port);
    }
    for (let i = 0; i < CodeManager.instance.graph.blocks[index].blockMould.dataImportNum; i++) {
        let port = document.createElement("div");
        port.style.left = "5px";
        port.style.top = (CodeManager.instance.graph.blocks[index].blockMould.logicImportNum + i) * 50 + 25 + 18.5 + "px";
        port.classList.add("dataport");
        div.appendChild(port);
    }
    for (let i = 0; i < CodeManager.instance.graph.blocks[index].blockMould.logicExportNum; i++) {
        let port = document.createElement("div");
        port.style.right = "5px";
        port.style.top = i * 50 + 25 + 16 + "px";
        port.classList.add("logicport");
        div.appendChild(port);
    }
    for (let i = 0; i < CodeManager.instance.graph.blocks[index].blockMould.dataExportNum; i++) {
        let port = document.createElement("div");
        port.style.right = "7px";
        port.style.top = (CodeManager.instance.graph.blocks[index].blockMould.logicExportNum + i) * 50 + 25 + 18.5 + "px";
        port.classList.add("dataport");
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
        tmpblock.style.left = resX * 50 + 25 + "px";
        tmpblock.style.top = resY * 50 + 25 + "px";
        tmpblock.style.zIndex = 5;
        CodeManager.instance.blockCoords[chosedBlockIndex] = {
            x1: resX,
            x2: resX + CodeManager.instance.graph.blocks[chosedBlockIndex].blockMould.size.width + 1,
            y1: resY,
            y2: resY + CodeManager.instance.graph.blocks[chosedBlockIndex].blockMould.size.height + 1
        };
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