import BlockLibraryManager from "./core/BlockLibraryManager.js";
import LanguageManager from "./language.js";

const opBlockSelector = document.getElementById("opBlockSelector");


for (let blockLib in BlockLibraryManager.instance.libraries) {
    let div = document.createElement("div");
    div.classList.add("selectorElement");
    div.classList.add("contentHover");
    div.onclick = () => {
        console.log(blockLib);
    };
    let p = document.createElement("p");
    p.setAttribute("name", blockLib);
    div.appendChild(p);
    opBlockSelector.appendChild(div);
}

LanguageManager.changeLanguage("English");