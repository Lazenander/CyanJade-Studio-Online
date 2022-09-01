import LanguageManager from "./language.js"

const cssLink = document.getElementById("cssLink");
const sel_dark = document.getElementById("sel_dark");
const sel_light = document.getElementById("sel_light");
const opFileSelector = document.getElementById("opFileSelector");
const opBlockSelector = document.getElementById("opBlockSelector");
const opSettingSelector = document.getElementById("opSettingSelector");

let activated = "disabled";
let currentTheme = "light";

function deactivate() {
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