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
        "l_i_s_normal": {
            "Chinese": "正常",
            "English": "Normal"
        },
        "l_i_s_busy": {
            "Chinese": "忙碌中",
            "English": "Busy"
        },
        "l_i_s_error": {
            "Chinese": "错误",
            "English": "Error"
        },
        "l_i_s_warning": {
            "Chinese": "警告",
            "English": "Warning"
        },
        "l_i_s_errorat": {
            "Chinese": "错误出现在指令",
            "English": "Error occurred at Block "
        },
        "l_i_blocks": {
            "Chinese": "指令数",
            "English": "Blocks"
        },
        "l_BLibContainer": {
            "Chinese": "指令库",
            "English": "Block Library"
        },
        "l_MainThreadContainer": {
            "Chinese": "主流程",
            "English": "Main Flow"
        },
        "l_mould_name": {
            "Chinese": "模块代号",
            "English": "Mould Name"
        },
        "l_mould_type": {
            "Chinese": "模块类型",
            "English": "Mould Type"
        },
        "l_mould_color": {
            "Chinese": "模块库颜色",
            "English": "MouldLib Color"
        },
        "l_mould_size": {
            "Chinese": "模块大小",
            "English": "Mould Size"
        },
        "l_mould_type_data": {
            "Chinese": "数据模块",
            "English": "Data"
        },
        "l_mould_type_logic": {
            "Chinese": "逻辑模块",
            "English": "Logic"
        },
        "l_mould_input": {
            "Chinese": "输入变量",
            "English": "Input Variables"
        },
        "l_mould_output": {
            "Chinese": "输出变量",
            "English": "Output Variable"
        },
        "l_mould_output_port": {
            "Chinese": "输出节点",
            "English": "Output Port"
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
    static getPhrase(phraseID) {
        return LanguageManager.phrases[phraseID][LanguageManager.currentLanguage];
    }
}