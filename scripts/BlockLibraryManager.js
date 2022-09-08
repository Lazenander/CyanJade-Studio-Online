import BlockLibrary from "./BlockLibrary.js";
import BlockMould from "./BlockMould.js";
import DataStream from "./DataStream.js";
import ErrorManager from "./ErrorManager.js";
import VariableTable from "./VariableTable.js";

export default class BlockLibraryManager {
    static instance = new BlockLibraryManager();
    constructor() {
        this.libraries = {};
        let basic = new BlockLibrary("sys_lib_basic", { "English": "Basic", "Chinese": "基础指令" }, "#2c9678");
        basic.BlockMoulds["assign"] = new BlockMould("assign", { "English": "assign", "Chinese": "赋值" }, "logic", "assign", "sys_lib_basic", { width: 2, height: 2 }, 1, 1, 1, 0, (innerInput, preDataFLow) => {
            let ds = new DataStream();
            ds.read(innerInput[0]);
            if (ds.type != "variable") {
                ErrorManager.error(1, ds.data);
                return {
                    logicport: 0,
                    dataOutput: [new DataStream()]
                }
            }
            VariableTable.assignVariable(ds, preDataFLow[0]);
            return {
                logicport: 0,
                dataOutput: [ds]
            }
        });
        basic.BlockMoulds["input"] = new BlockMould("input", { "English": "input", "Chinese": "输入" }, "data", "input", "sys_lib_basic", { width: 2, height: 1 }, 0, 0, 0, 1, (innerInput, preDataFLow) => {
            let ds = new DataStream();
            ds.data = innerInput[0].readData();
            if (innerInput[0].type == "variable")
                ds.type = innerInput[0].data.type;
            else
                ds.type = innerInput[0].type;
            return {
                logicport: -1,
                dataOutput: [ds]
            }
        });
        basic.BlockMoulds["output"] = new BlockMould("output", { "English": "output", "Chinese": "输出" }, "logic", "output", "sys_lib_basic", { width: 2, height: 2 }, 1, 0, 1, 0, (innerInput, preDataFLow) => {
            return {
                logicport: -1,
                dataOutput: []
            }
        });
        basic.BlockMoulds["if"] = new BlockMould("if", { "English": "if", "Chinese": "如果" }, "logic", "if", "sys_lib_basic", { width: 2, height: 3 }, 1, 3, 1, 0, (innerInput, preDataFLow) => {
            if (preDataFLow.type == "boolean" && preDataFLow.data == true || preDataFLow.type == "number" && preDataFLow.data != 0 || preDataFLow.type == "string" && preDataFLow.data != "")
                return { logicport: 0, dataOutput: [] };
            return { logicport: 1, dataOutput: [] };
        });
        basic.BlockMoulds["while"] = new BlockMould("while", { "English": "while", "Chinese": "循环" }, "logic", "while", "sys_lib_basic", { width: 2, height: 2 }, 1, 2, 1, 0, (innerInput, preDataFLow) => {
            return {
                logicport: -1,
                dataOutput: []
            }
        });
        this.libraries["sys_lib_basic"] = basic;
        basic = new BlockLibrary("sys_lib_math", { "English": "Math", "Chinese": "数学指令" }, "#2c9678");
        basic.BlockMoulds["test2"] = new BlockMould("test2", { "English": "test2", "Chinese": "测试2" }, "test", "sys_lib_math", { width: 2, height: 3 }, 1, 1, 2, 1, () => {});
        this.libraries["sys_lib_math"] = basic;
    }
}