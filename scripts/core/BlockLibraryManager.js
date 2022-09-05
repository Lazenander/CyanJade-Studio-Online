import BlockLibrary from "./BlockLibrary.js";
import BlockMould from "./BlockMould.js";

export default class BlockLibraryManager {
    static instance = new BlockLibraryManager();
    constructor() {
        this.libraries = {};
        let basic = new BlockLibrary("sys_lib_basic", { "English": "Basic", "Chinese": "基础指令" }, "#2c9678");
        basic.BlockMoulds["test"] = new BlockMould("test", { "English": "test", "Chinese": "测试" }, "test", "sys_lib_basic", { width: 2, height: 3 }, 1, 1, 2, 1, () => {});
        this.libraries["sys_lib_basic"] = basic;
        basic = new BlockLibrary("sys_lib_math", { "English": "Math", "Chinese": "数学指令" }, "#2c9678");
        basic.BlockMoulds["test2"] = new BlockMould("test2", { "English": "test2", "Chinese": "测试2" }, "test", "sys_lib_basic", { width: 2, height: 3 }, 1, 1, 2, 1, () => {});
        this.libraries["sys_lib_math"] = basic;
    }
}