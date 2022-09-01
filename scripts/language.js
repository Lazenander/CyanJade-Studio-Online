let phrases = {
    "l_op_file": {
        "Chinese": "文件",
        "English": "File"
    },
    "l_op_block": {
        "Chinese": "指令块",
        "English": "Block"
    },
    "l_op_tutorial": {
        "Chinese": "教程",
        "English": "Tutorial"
    }
};

export default function changeLanguage(language = "English") {
    for (let phraseID in phrases) {
        let element = document.getElementsByName(phraseID)[0];
        element.innerText = phrases[phraseID][language];
    }
}