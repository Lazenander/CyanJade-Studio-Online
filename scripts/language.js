export default class LanguageManager {
    static phrases = {
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
        },
        "l_op_setting": {
            "Chinese": "设置",
            "English": "Settings"
        },
        "l_sel_newFile": {
            "Chinese": "新建文件",
            "English": "New File"
        },
        "l_sel_openFile": {
            "Chinese": "打开文件",
            "English": "Open File"
        },
        "l_sel_saveFile": {
            "Chinese": "保存文件",
            "English": "Save File"
        },
        "l_sel_importBlockLib": {
            "Chinese": "导入指令库",
            "English": "Import BLib"
        },
        "l_sel_light": {
            "Chinese": "切换暗主题",
            "English": "Dark Theme"
        },
        "l_sel_dark": {
            "Chinese": "切换亮主题",
            "English": "Light Theme"
        },
        "l_sel_language": {
            "Chinese": "Use English",
            "English": "使用简体中文"
        },
        "l_i_studio": {
            "Chinese": "青玉案",
            "English": "CyanJade Studio"
        },
        "l_i_status": {
            "Chinese": "状态",
            "English": "Status"
        },
        "l_i_blocks": {
            "Chinese": "指令数",
            "English": "Blocks"
        }
    };
    static currentLanguage = "English";
    static changeLanguage(language = "English") {
        LanguageManager.currentLanguage = language;
        for (let phraseID in LanguageManager.phrases) {
            let elements = document.getElementsByName(phraseID);
            if (elements)
                for (let element of elements)
                    element.innerText = LanguageManager.phrases[phraseID][language];
            else
                continue;
        }
    }
    static addPhrase(phraseID, Tphrase) {
        LanguageManager.phrases[phraseID] = Tphrase;
    }
}