import BlockLibrary from "./BlockLibrary.js";
import BlockMould from "./BlockMould.js";

export default class BlockLibraryManager {
    static instance = new BlockLibraryManager();
    constructor() {
        this.libraries = {};
        let basic = new BlockLibrary("sys_lib_basic", { "English": "Basic", "Chinese": "基础指令" }, "#2c9678");
        basic.BlockMoulds = new BlockMould("test", "test", "sys_lib_basic", { width: 2, height: 1 }, 1, 1, 2, 1, () => {});
        this.libraries["sys_lib_basic"] = basic;
    }
}