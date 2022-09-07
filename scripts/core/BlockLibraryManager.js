import BlockLibrary from "./BlockLibrary.js";
import BlockMould from "./BlockMould.js";

export default class BlockLibraryManager {
    static instance = new BlockLibraryManager();
    constructor() {
        this.libraries = {};
        let basic = new BlockLibrary("sys_lib_basic", { "English": "Basic", "Chinese": "基础指令" }, "#2c9678");
        basic.BlockMoulds["assign"] = new BlockMould("assign", { "English": "assign", "Chinese": "赋值" }, "assign", "sys_lib_basic", { width: 2, height: 2 }, 1, 1, 1, 0, () => {});
        basic.BlockMoulds["input"] = new BlockMould("input", { "English": "input", "Chinese": "输入" }, "input", "sys_lib_basic", { width: 2, height: 1 }, 0, 0, 0, 1, () => {});
        basic.BlockMoulds["output"] = new BlockMould("output", { "English": "output", "Chinese": "输出" }, "output", "sys_lib_basic", { width: 2, height: 2 }, 1, 0, 1, 0, () => {});
        basic.BlockMoulds["if"] = new BlockMould("if", { "English": "if", "Chinese": "如果" }, "if", "sys_lib_basic", { width: 2, height: 3 }, 1, 3, 1, 0, () => {});
        basic.BlockMoulds["while"] = new BlockMould("while", { "English": "while", "Chinese": "循环" }, "while", "sys_lib_basic", { width: 2, height: 2 }, 1, 2, 1, 0, () => {});
        this.libraries["sys_lib_basic"] = basic;
        basic = new BlockLibrary("sys_lib_math", { "English": "Math", "Chinese": "数学指令" }, "#2c9678");
        basic.BlockMoulds["test2"] = new BlockMould("test2", { "English": "test2", "Chinese": "测试2" }, "test", "sys_lib_math", { width: 2, height: 3 }, 1, 1, 2, 1, () => {});
        this.libraries["sys_lib_math"] = basic;
    }
}