import BlockLibraryManager from "./core/BlockLibraryManager.js";
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
const canvasArea = document.getElementById("canvasArea");
const blockArea = document.getElementById("blockArea");
const shadowBlock = document.getElementById("shadowBlock");

let activated = "disabled";
let blockLibDisplay = "disabled";
let currentTheme = "light";
let chosedBlockMould = null;
let shadowActivated = false;

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
    let calX = px2grid(event.offsetX) * 50;
    let calY = px2grid(event.offsetY) * 50;
    shadowBlock.style.left = calX - (chosedBlockMould.size.width + 1) * 20 + "px";
    shadowBlock.style.top = calY - (chosedBlockMould.size.height + 1) * 20 + "px";
}

window.dragAreaDropDetected = (event) => {}

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
            div2.ondrag = () => {
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

LanguageManager.changeLanguage("English");