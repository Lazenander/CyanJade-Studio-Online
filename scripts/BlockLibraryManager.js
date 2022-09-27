import BlockLibrary from "./BlockLibrary.js";
import BlockMould from "./BlockMould.js";
import DataStream from "./DataStream.js";
import ErrorManager from "./ErrorManager.js";
import VariableTable from "./VariableTable.js";

function formBasic() {
    let basic = new BlockLibrary("sys_lib_basic", { "English": "Basic", "Chinese": "基础指令" }, "#2c9678");

    basic.BlockMoulds["assign"] = new BlockMould("assign", { "English": "assign", "Chinese": "赋值" }, "logic", "assign", "sys_lib_basic", { width: 2, height: 2 }, 1, 1, 1, 0, (innerInput, preDataStream, variableTables) => {
        let ds = innerInput[0];
        let flag = false;
        switch (ds.type) {
            case "variable":
                for (let i = variableTables.length - 1; i >= 0; i--)
                    if (variableTables[i].existVariable(ds)) {
                        variableTables[i].changeVariable(ds, preDataStream[0]);
                        flag = true;
                        break;
                    }
                if (!flag)
                    variableTables[variableTables.length - 1].assignVariable(ds, preDataStream[0]);
                return {
                    logicport: 0,
                    dataOutput: []
                };
            case "variableArrayElement":
                for (let i = variableTables.length - 1; i >= 0; i--)
                    if (variableTables[i].existVariable(ds)) {
                        variableTables[i].changeVariable(ds, preDataStream[0]);
                        flag = true;
                        break;
                    }
                if (!flag)
                    ErrorManager.error(4, ds.data.name);
                return {
                    logicport: 0,
                    dataOutput: []
                };
            default:
                ErrorManager.error(1, ds.data);
                return {
                    logicport: 0,
                    dataOutput: []
                };
        }
    });

    basic.BlockMoulds["input"] = new BlockMould("input", { "English": "input", "Chinese": "输入" }, "data", "input", "sys_lib_basic", { width: 3, height: 1 }, 0, 0, 0, 1, (innerInput, preDataStream, variableTables) => {
        let ds = innerInput[0].readData(variableTables);
        return {
            logicport: -1,
            dataOutput: [ds]
        }
    });

    basic.BlockMoulds["output"] = new BlockMould("output", { "English": "output", "Chinese": "输出" }, "logic", "output", "sys_lib_basic", { width: 3, height: 2 }, 1, 0, 1, 0, (innerInput, preDataStream, variableTables) => {
        return {
            logicport: -1,
            dataOutput: []
        }
    });

    basic.BlockMoulds["if"] = new BlockMould("if", { "English": "if", "Chinese": "如果" }, "logic", "switch", "sys_lib_basic", { width: 1, height: 3 }, 1, 3, 1, 0, (innerInput, preDataStream, variableTables) => {
        let ds = preDataStream[0].readData(variableTables);
        if (ds.type == "boolean" && ds.data == true || ds.type == "number" && ds.data != 0 || ds.type == "string" && ds.data != "")
            return { logicport: 0, dataOutput: [] };
        return { logicport: 1, dataOutput: [] };
    });

    basic.BlockMoulds["while"] = new BlockMould("while", { "English": "while", "Chinese": "循环" }, "logic", "loop", "sys_lib_basic", { width: 2, height: 2 }, 1, 2, 1, 0, (innerInput, preDataStream, variableTables) => {
        let ds = preDataStream[0].readData(variableTables);
        if (ds.type == "boolean" && ds.data == true || ds.type == "number" && ds.data != 0 || ds.type == "string" && ds.data != "")
            return { logicport: 0, dataOutput: [] };
        return { logicport: 1, dataOutput: [] };
    });

    return basic;
}

function formMath() {
    let math = new BlockLibrary("sys_lib_math", { "English": "Math", "Chinese": "数学指令" }, "#2c9678");
    math.BlockMoulds["plus"] = new BlockMould("plus", { "English": "+", "Chinese": "+" }, "data", "plus", "sys_lib_math", { width: 1, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "number" && ds2.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, ds1.data + ds2.data)] };
        else if (ds1.type == "array" && ds2.type == "array")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, [...ds1.data, ...ds2.data])] };
        else if (ds1.type == "array" && ds2.type == "number") {
            let lst = [...ds1.data];
            for (let i = 0; i < lst.length; i++)
                lst[i] += ds2.data;
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lst)] };
        }
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["minus"] = new BlockMould("minus", { "English": "-", "Chinese": "-" }, "data", "minus", "sys_lib_math", { width: 1, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "number" && ds2.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, ds1.data - ds2.data)] };
        else if (ds1.type == "array" && ds2.type == "array")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, [...ds1.data, ...ds2.data])] };
        else if (ds1.type == "array" && ds2.type == "number") {
            let lst = [...ds1.data];
            for (let i = 0; i < lst.length; i++)
                lst[i] -= ds2.data;
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lst)] };
        }
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["multiplication"] = new BlockMould("multiplication", { "English": "×", "Chinese": "×" }, "data", "multiplication", "sys_lib_math", { width: 1, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "number" && ds2.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, ds1.data * ds2.data)] };
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["divison"] = new BlockMould("divison", { "English": "÷", "Chinese": "÷" }, "data", "divison", "sys_lib_math", { width: 1, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "number" && ds2.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, ds1.data / ds2.data)] };
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["mod"] = new BlockMould("mod", { "English": "mod", "Chinese": "取余" }, "data", "divison", "sys_lib_math", { width: 1, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "number" && ds2.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, ds1.data % ds2.data)] };
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["abs"] = new BlockMould("abs", { "English": "abs", "Chinese": "绝对值" }, "data", "abs", "sys_lib_math", { width: 1, height: 1 }, 0, 0, 1, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        if (ds1.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.abs(ds1.data))] };
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["sqrt"] = new BlockMould("sqrt", { "English": "sqrt", "Chinese": "开根" }, "data", "sqrt", "sys_lib_math", { width: 1, height: 1 }, 0, 0, 1, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        if (ds1.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.sqrt(ds1.data))] };
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["constant_e"] = new BlockMould("constant_e", { "English": "e", "Chinese": "e" }, "data", "constant_e", "sys_lib_math", { width: 1, height: 1 }, 0, 0, 0, 1, (innerInput, preDataStream, variableTables) => {
        return { logicport: -1, dataOutput: [new DataStream("number", Math.E)] };
    });

    math.BlockMoulds["exp"] = new BlockMould("exp", { "English": "exp", "Chinese": "exp" }, "data", "exp", "sys_lib_math", { width: 1, height: 1 }, 0, 0, 1, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        if (ds1.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.exp(ds1.data))] };
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["pow"] = new BlockMould("pow", { "English": "pow", "Chinese": "次方" }, "data", "pow", "sys_lib_math", { width: 1, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "number" && ds2.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.pow(ds1.data, ds2.data))] };
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["ln"] = new BlockMould("ln", { "English": "ln", "Chinese": "ln" }, "data", "ln", "sys_lib_math", { width: 1, height: 1 }, 0, 0, 1, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        if (ds1.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.log(ds1.data))] };
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["log"] = new BlockMould("log", { "English": "log", "Chinese": "log" }, "data", "log", "sys_lib_math", { width: 1, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "number" && ds2.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.log(ds1.data) / Math.log(ds2.data))] };
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["b_not"] = new BlockMould("b_not", { "English": "B NOT", "Chinese": "位非" }, "data", "b_not", "sys_lib_math", { width: 2, height: 1 }, 0, 0, 1, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        if (ds1.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, ~ds1.data)] };
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["b_and"] = new BlockMould("b_and", { "English": "B AND", "Chinese": "位与" }, "data", "b_and", "sys_lib_math", { width: 2, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "number" && ds2.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, ds1.data & ds2.data)] };
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["b_or"] = new BlockMould("b_or", { "English": "B OR", "Chinese": "位或" }, "data", "b_or", "sys_lib_math", { width: 2, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "number" && ds2.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, ds1.data | ds2.data)] };
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["b_xor"] = new BlockMould("b_xor", { "English": "B XOR", "Chinese": "位异或" }, "data", "b_xor", "sys_lib_math", { width: 2, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "number" && ds2.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, ds1.data ^ ds2.data)] };
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["SHL"] = new BlockMould("SHL", { "English": "SHL", "Chinese": "左移" }, "data", "SHL", "sys_lib_math", { width: 1, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "number" && ds2.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, ds1.data << ds2.data)] };
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["SHR"] = new BlockMould("SHR", { "English": "SHR", "Chinese": "右移" }, "data", "SHR", "sys_lib_math", { width: 1, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "number" && ds2.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, ds1.data >> ds2.data)] };
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["constant_pi"] = new BlockMould("constant_pi", { "English": "π", "Chinese": "π" }, "data", "constant_pi", "sys_lib_math", { width: 1, height: 1 }, 0, 0, 0, 1, (innerInput, preDataStream, variableTables) => {
        return { logicport: -1, dataOutput: [new DataStream("number", Math.PI)] };
    });

    math.BlockMoulds["sin"] = new BlockMould("sin", { "English": "sin", "Chinese": "sin" }, "data", "sin", "sys_lib_math", { width: 1, height: 1 }, 0, 0, 1, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        if (ds1.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.sin(ds1.data))] };
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["cos"] = new BlockMould("cos", { "English": "cos", "Chinese": "cos" }, "data", "cos", "sys_lib_math", { width: 1, height: 1 }, 0, 0, 1, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        if (ds1.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.cos(ds1.data))] };
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["tan"] = new BlockMould("tan", { "English": "tan", "Chinese": "tan" }, "data", "tan", "sys_lib_math", { width: 1, height: 1 }, 0, 0, 1, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        if (ds1.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.tan(ds1.data))] };
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["asin"] = new BlockMould("asin", { "English": "asin", "Chinese": "asin" }, "data", "asin", "sys_lib_math", { width: 1, height: 1 }, 0, 0, 1, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        if (ds1.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.asin(ds1.data))] };
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["acos"] = new BlockMould("acos", { "English": "acos", "Chinese": "acos" }, "data", "acos", "sys_lib_math", { width: 1, height: 1 }, 0, 0, 1, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        if (ds1.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.acos(ds1.data))] };
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["atan"] = new BlockMould("atan", { "English": "atan", "Chinese": "atan" }, "data", "atan", "sys_lib_math", { width: 1, height: 1 }, 0, 0, 1, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        if (ds1.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.atan(ds1.data))] };
        return { logicport: -1, dataOutput: [new DataStream()] };
    });
    return math;
}

function formLogic() {
    let logic = new BlockLibrary("sys_lib_logic", { "English": "Logic", "Chinese": "逻辑指令" }, "#2c9678");

    logic.BlockMoulds["and"] = new BlockMould("and", { "English": "and", "Chinese": "与" }, "data", "and", "sys_lib_logic", { width: 1, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        return { logicport: -1, dataOutput: [new DataStream("boolean", (ds1.data && ds2.data) ? true : false)] };
    });


    logic.BlockMoulds["or"] = new BlockMould("or", { "English": "or", "Chinese": "或" }, "data", "or", "sys_lib_logic", { width: 1, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        return { logicport: -1, dataOutput: [new DataStream("boolean", (ds1.data || ds2.data) ? true : false)] };
    });


    logic.BlockMoulds["not"] = new BlockMould("not", { "English": "not", "Chinese": "非" }, "data", "not", "sys_lib_logic", { width: 1, height: 1 }, 0, 0, 1, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        return { logicport: -1, dataOutput: [new DataStream("boolean", (!ds1.data) ? true : false)] };
    });

    logic.BlockMoulds["equal"] = new BlockMould("equal", { "English": "equal", "Chinese": "等于" }, "data", "equal", "sys_lib_logic", { width: 2, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        return { logicport: -1, dataOutput: [new DataStream("boolean", (ds1.data == ds2.data) ? true : false)] };
    });

    logic.BlockMoulds["unequal"] = new BlockMould("unequal", { "English": "unequal", "Chinese": "不等于" }, "data", "unequal", "sys_lib_logic", { width: 2, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        return { logicport: -1, dataOutput: [new DataStream("boolean", (ds1.data != ds2.data) ? true : false)] };
    });

    logic.BlockMoulds["greater"] = new BlockMould("greater", { "English": "greater", "Chinese": "大于" }, "data", "greater", "sys_lib_logic", { width: 2, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        return { logicport: -1, dataOutput: [new DataStream("boolean", (ds1.data > ds2.data) ? true : false)] };
    });

    logic.BlockMoulds["egreater"] = new BlockMould("egreater", { "English": "eq-greater", "Chinese": "大于等于" }, "data", "egreater", "sys_lib_logic", { width: 2, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        return { logicport: -1, dataOutput: [new DataStream("boolean", (ds1.data >= ds2.data) ? true : false)] };
    });

    logic.BlockMoulds["less"] = new BlockMould("less", { "English": "less", "Chinese": "小于" }, "data", "less", "sys_lib_logic", { width: 2, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        return { logicport: -1, dataOutput: [new DataStream("boolean", (ds1.data < ds2.data) ? true : false)] };
    });

    logic.BlockMoulds["eless"] = new BlockMould("eless", { "English": "eq-less", "Chinese": "小于等于" }, "data", "eless", "sys_lib_logic", { width: 2, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        return { logicport: -1, dataOutput: [new DataStream("boolean", (ds1.data <= ds2.data) ? true : false)] };
    });

    return logic;
}

function formArray() {
    let array = new BlockLibrary("sys_lib_array", { "English": "Array", "Chinese": "数列指令" }, "#2c9678");

    array.BlockMoulds["push"] = new BlockMould("push", { "English": "push", "Chinese": "推入列尾" }, "data", "push", "sys_lib_array", { width: 2, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "array")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, [...ds1.data, ds2])] };
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    array.BlockMoulds["concat"] = new BlockMould("concat", { "English": "concat", "Chinese": "数列合并" }, "data", "concat", "sys_lib_array", { width: 2, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "array" && ds2.type == "array")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, [...ds1.data, ...ds2.data])] };
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    array.BlockMoulds["pop"] = new BlockMould("pop", { "English": "pop", "Chinese": "弹出列尾" }, "data", "pop", "sys_lib_array", { width: 2, height: 1 }, 0, 0, 1, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        if (ds1.type == "array") {
            ds1.data.pop();
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, ds1.data)] };
        }
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    array.BlockMoulds["shift"] = new BlockMould("shift", { "English": "shift", "Chinese": "弹出列首" }, "data", "shift", "sys_lib_array", { width: 2, height: 1 }, 0, 0, 1, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        if (ds1.type == "array") {
            ds1.data.shift();
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, ds1.data)] };
        }
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    array.BlockMoulds["cut"] = new BlockMould("cut", { "English": "cut", "Chinese": "数列切割" }, "data", "cut", "sys_lib_array", { width: 2, height: 3 }, 0, 0, 3, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        let ds3 = preDataStream[2].readData(variableTables).duplicate();
        if (ds1.type == "array" && ds2.type == "number" && ds3.type == "number") {
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, ds1.data.slice(ds2.data, ds3.data))] };
        }
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    return array;
}

export default class BlockLibraryManager {
    static instance = new BlockLibraryManager();
    constructor() {
        this.libraries = {};
        this.libraries["sys_lib_basic"] = formBasic();
        this.libraries["sys_lib_math"] = formMath();
        this.libraries["sys_lib_logic"] = formLogic();
        this.libraries["sys_lib_array"] = formArray();
    }
}