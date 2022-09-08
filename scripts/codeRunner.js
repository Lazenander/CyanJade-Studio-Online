import CodeManager from "./codeManager.js";

let isCodeRunning = false;

const lockArea = document.getElementById('lockArea');
const img_runButton = document.getElementById('img_runButton');

window.runCode = () => {
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
    } else {
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
}