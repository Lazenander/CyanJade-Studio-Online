import BlockLibrary from "./BlockLibrary.js";
import BlockMould from "./BlockMould.js";
import DataStream from "./DataStream.js";
import ErrorManager from "./ErrorManager.js";
import VariableTable from "./VariableTable.js";

function formBasic() {
    let basic = new BlockLibrary("sys_lib_basic", { "English": "Basic", "Chinese": "基础指令" }, "#2c9678");
    basic.BlockMoulds["assign"] = new BlockMould("assign", { "English": "assign", "Chinese": "赋值" }, "logic", "assign", "sys_lib_basic", { width: 2, height: 2 }, 1, 1, 1, 0, (innerInput, preDataStream) => {
        let ds = innerInput[0];
        if (ds.type != "variable") {
            ErrorManager.error(1, ds.data);
            return {
                logicport: 0,
                dataOutput: [new DataStream()]
            }
        }
        VariableTable.instance.assignVariable(ds, preDataStream[0]);
        return {
            logicport: 0,
            dataOutput: [0]
        }
    });
    basic.BlockMoulds["input"] = new BlockMould("input", { "English": "input", "Chinese": "输入" }, "data", "input", "sys_lib_basic", { width: 2, height: 1 }, 0, 0, 0, 1, (innerInput, preDataStream) => {
        let ds = innerInput[0].readData();
        return {
            logicport: -1,
            dataOutput: [ds]
        }
    });
    basic.BlockMoulds["output"] = new BlockMould("output", { "English": "output", "Chinese": "输出" }, "logic", "output", "sys_lib_basic", { width: 2, height: 2 }, 1, 0, 1, 0, (innerInput, preDataStream) => {
        return {
            logicport: -1,
            dataOutput: []
        }
    });
    basic.BlockMoulds["if"] = new BlockMould("if", { "English": "if", "Chinese": "如果" }, "logic", "switch", "sys_lib_basic", { width: 2, height: 3 }, 1, 3, 1, 0, (innerInput, preDataStream) => {
        let ds = preDataStream[0].readData();
        if (ds.type == "boolean" && ds.data == true || ds.type == "number" && ds.data != 0 || ds.type == "string" && ds.data != "")
            return { logicport: 0, dataOutput: [] };
        return { logicport: 1, dataOutput: [] };
    });
    basic.BlockMoulds["while"] = new BlockMould("while", { "English": "while", "Chinese": "循环" }, "logic", "loop", "sys_lib_basic", { width: 2, height: 2 }, 1, 2, 1, 0, (innerInput, preDataStream) => {
        let ds = preDataStream[0].readData();
        if (ds.type == "boolean" && ds.data == true || ds.type == "number" && ds.data != 0 || ds.type == "string" && ds.data != "")
            return { logicport: 0, dataOutput: [] };
        return { logicport: 1, dataOutput: [] };
    });

    return basic;
}

function formMath() {
    let math = new BlockLibrary("sys_lib_math", { "English": "Math", "Chinese": "数学指令" }, "#2c9678");
    math.BlockMoulds["plus"] = new BlockMould("plus", { "English": "+", "Chinese": "+" }, "data", "plus", "sys_lib_math", { width: 2, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream) => {
        let ds1 = preDataStream[0].readData();
        let ds2 = preDataStream[1].readData();
        if (ds1.type == "number" && ds2.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, ds1.data + ds2.data)] };
    });
    math.BlockMoulds["minus"] = new BlockMould("minus", { "English": "-", "Chinese": "-" }, "data", "minus", "sys_lib_math", { width: 2, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream) => {
        console.log(preDataStream[1]);
        let ds1 = preDataStream[0].readData();
        let ds2 = preDataStream[1].readData();
        if (ds1.type == "number" && ds2.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, ds1.data - ds2.data)] };
    });
    math.BlockMoulds["multiplication"] = new BlockMould("multiplication", { "English": "×", "Chinese": "×" }, "data", "multiplication", "sys_lib_math", { width: 2, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream) => {
        let ds1 = preDataStream[0].readData();
        let ds2 = preDataStream[1].readData();
        if (ds1.type == "number" && ds2.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, ds1.data * ds2.data)] };
    });
    math.BlockMoulds["divison"] = new BlockMould("divison", { "English": "÷", "Chinese": "÷" }, "data", "divison", "sys_lib_math", { width: 2, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream) => {
        let ds1 = preDataStream[0].readData();
        let ds2 = preDataStream[1].readData();
        if (ds1.type == "number" && ds2.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, ds1.data / ds2.data)] };
    });
    math.BlockMoulds["mod"] = new BlockMould("mod", { "English": "mod", "Chinese": "取余" }, "data", "divison", "sys_lib_math", { width: 2, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream) => {
        let ds1 = preDataStream[0].readData();
        let ds2 = preDataStream[1].readData();
        if (ds1.type == "number" && ds2.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, ds1.data % ds2.data)] };
    });
    math.BlockMoulds["abs"] = new BlockMould("abs", { "English": "abs", "Chinese": "绝对值" }, "data", "abs", "sys_lib_math", { width: 2, height: 2 }, 0, 0, 1, 1, (innerInput, preDataStream) => {
        let ds1 = preDataStream[0].readData();
        if (ds1.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.abs(ds1.data))] };
    });
    math.BlockMoulds["sqrt"] = new BlockMould("sqrt", { "English": "sqrt", "Chinese": "开根" }, "data", "sqrt", "sys_lib_math", { width: 2, height: 2 }, 0, 0, 1, 1, (innerInput, preDataStream) => {
        let ds1 = preDataStream[0].readData();
        if (ds1.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.sqrt(ds1.data))] };
    });
    math.BlockMoulds["constant_e"] = new BlockMould("constant_e", { "English": "constant e", "Chinese": "常数e" }, "data", "constant_e", "sys_lib_math", { width: 2, height: 2 }, 0, 0, 0, 1, (innerInput, preDataStream) => {
        return { logicport: -1, dataOutput: [new DataStream("number", Math.E)] };
    });
    math.BlockMoulds["exp"] = new BlockMould("exp", { "English": "exp", "Chinese": "exp" }, "data", "exp", "sys_lib_math", { width: 2, height: 2 }, 0, 0, 1, 1, (innerInput, preDataStream) => {
        let ds1 = preDataStream[0].readData();
        if (ds1.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.exp(ds1.data))] };
    });
    math.BlockMoulds["pow"] = new BlockMould("pow", { "English": "pow", "Chinese": "次方" }, "data", "pow", "sys_lib_math", { width: 2, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream) => {
        let ds1 = preDataStream[0].readData();
        let ds2 = preDataStream[1].readData();
        if (ds1.type == "number" && ds2.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.pow(ds1.data, ds2.data))] };
    });
    math.BlockMoulds["ln"] = new BlockMould("ln", { "English": "ln", "Chinese": "ln" }, "data", "ln", "sys_lib_math", { width: 2, height: 2 }, 0, 0, 1, 1, (innerInput, preDataStream) => {
        let ds1 = preDataStream[0].readData();
        if (ds1.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.log(ds1.data))] };
    });
    math.BlockMoulds["log"] = new BlockMould("log", { "English": "log", "Chinese": "log" }, "data", "log", "sys_lib_math", { width: 2, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream) => {
        let ds1 = preDataStream[0].readData();
        let ds2 = preDataStream[1].readData();
        if (ds1.type == "number" && ds2.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.log(ds1.data) / Math.log(ds2.data))] };
    });
    math.BlockMoulds["constant_pi"] = new BlockMould("constant_pi", { "English": "constant π", "Chinese": "常数π" }, "data", "constant_pi", "sys_lib_math", { width: 2, height: 2 }, 0, 0, 0, 1, (innerInput, preDataStream) => {
        return { logicport: -1, dataOutput: [new DataStream("number", Math.PI)] };
    });
    math.BlockMoulds["sin"] = new BlockMould("sin", { "English": "sin", "Chinese": "sin" }, "data", "sin", "sys_lib_math", { width: 2, height: 2 }, 0, 0, 1, 1, (innerInput, preDataStream) => {
        let ds1 = preDataStream[0].readData();
        if (ds1.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.sin(ds1.data))] };
    });
    math.BlockMoulds["cos"] = new BlockMould("cos", { "English": "cos", "Chinese": "cos" }, "data", "cos", "sys_lib_math", { width: 2, height: 2 }, 0, 0, 1, 1, (innerInput, preDataStream) => {
        let ds1 = preDataStream[0].readData();
        if (ds1.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.cos(ds1.data))] };
    });
    math.BlockMoulds["tan"] = new BlockMould("tan", { "English": "tan", "Chinese": "tan" }, "data", "tan", "sys_lib_math", { width: 2, height: 2 }, 0, 0, 1, 1, (innerInput, preDataStream) => {
        let ds1 = preDataStream[0].readData();
        if (ds1.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.tan(ds1.data))] };
    });
    math.BlockMoulds["asin"] = new BlockMould("asin", { "English": "asin", "Chinese": "asin" }, "data", "asin", "sys_lib_math", { width: 2, height: 2 }, 0, 0, 1, 1, (innerInput, preDataStream) => {
        let ds1 = preDataStream[0].readData();
        return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.asin(ds1.data))] };
    });
    math.BlockMoulds["acos"] = new BlockMould("acos", { "English": "acos", "Chinese": "acos" }, "data", "acos", "sys_lib_math", { width: 2, height: 2 }, 0, 0, 1, 1, (innerInput, preDataStream) => {
        let ds1 = preDataStream[0].readData();
        if (ds1.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.acos(ds1.data))] };
    });
    math.BlockMoulds["atan"] = new BlockMould("atan", { "English": "atan", "Chinese": "atan" }, "data", "atan", "sys_lib_math", { width: 2, height: 2 }, 0, 0, 1, 1, (innerInput, preDataStream) => {
        let ds1 = preDataStream[0].readData();
        if (ds1.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.atan(ds1.data))] };
    });
    return math;
}

export default class BlockLibraryManager {
    static instance = new BlockLibraryManager();
    constructor() {
        this.libraries = {};
        this.libraries["sys_lib_basic"] = formBasic();
        this.libraries["sys_lib_math"] = formMath();
    }
}