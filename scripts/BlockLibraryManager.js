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
        else if (ds1.type == "array" && ds2.type == "number") {
            function lstAddNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data += ds2.data;
                    if (lst[i].type == "array")
                        lst[i].data = lstAddNum([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lstAddNum([...ds1.data]))] };
        } else if (ds1.type == "number" && ds2.type == "array") {
            function lstAddNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data += ds1.data;
                    if (lst[i].type == "array")
                        lst[i].data = lstAddNum([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds2.type, lstAddNum([...ds2.data]))] };
        }
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["minus"] = new BlockMould("minus", { "English": "-", "Chinese": "-" }, "data", "minus", "sys_lib_math", { width: 1, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "number" && ds2.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, ds1.data - ds2.data)] };
        else if (ds1.type == "array" && ds2.type == "number") {
            function lstMinusNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data -= ds2.data;
                    if (lst[i].type == "array")
                        lst[i].data = lstMinusNum([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lstMinusNum([...ds1.data]))] };
        } else if (ds1.type == "number" && ds2.type == "array") {
            function lstMinusNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data = ds1.data - lst[i].data;
                    if (lst[i].type == "array")
                        lst[i].data = lstMinusNum([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds2.type, lstMinusNum([...ds2.data]))] };
        }
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["multiplication"] = new BlockMould("multiplication", { "English": "×", "Chinese": "×" }, "data", "multiplication", "sys_lib_math", { width: 1, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "number" && ds2.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, ds1.data * ds2.data)] };
        else if (ds1.type == "array" && ds2.type == "number") {
            function lstMultiplyNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data *= ds2.data;
                    if (lst[i].type == "array")
                        lst[i].data = lstMultiplyNum([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lstMultiplyNum([...ds1.data]))] };
        } else if (ds1.type == "number" && ds2.type == "array") {
            function lstMultiplyNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data *= ds1.data;
                    if (lst[i].type == "array")
                        lst[i].data = lstMultiplyNum([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds2.type, lstMultiplyNum([...ds2.data]))] };
        }
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["divison"] = new BlockMould("divison", { "English": "÷", "Chinese": "÷" }, "data", "divison", "sys_lib_math", { width: 1, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "number" && ds2.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, ds1.data / ds2.data)] };
        else if (ds1.type == "array" && ds2.type == "number") {
            function lstDivideNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data /= ds2.data;
                    if (lst[i].type == "array")
                        lst[i].data = lstDivideNum([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lstDivideNum([...ds1.data]))] };
        } else if (ds1.type == "number" && ds2.type == "array") {
            function lstDivideNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data = ds1.data / lst[i].data;
                    if (lst[i].type == "array")
                        lst[i].data = lstDivideNum([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds2.type, lstDivideNum([...ds2.data]))] };
        }
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["mod"] = new BlockMould("mod", { "English": "mod", "Chinese": "取余" }, "data", "divison", "sys_lib_math", { width: 1, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "number" && ds2.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, ds1.data % ds2.data)] };
        else if (ds1.type == "array" && ds2.type == "number") {
            function lstModNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data %= ds2.data;
                    if (lst[i].type == "array")
                        lst[i].data = lstModNum([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lstModNum([...ds1.data]))] };
        } else if (ds1.type == "number" && ds2.type == "array") {
            function lstModNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data = ds2.data % lst[i].data;
                    if (lst[i].type == "array")
                        lst[i].data = lstModNum([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds2.type, lstModNum([...ds2.data]))] };
        }
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["max"] = new BlockMould("max", { "English": "max", "Chinese": "最大值" }, "data", "max", "sys_lib_math", { width: 2, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "number" && ds2.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.max(ds1.data, ds2.data))] };
        else if (ds1.type == "array" && ds2.type == "number") {
            function lstMaxNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data = Math.max(lst[i].data, ds2.data);
                    if (lst[i].type == "array")
                        lst[i].data = lstMaxNum([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lstMaxNum([...ds1.data]))] };
        } else if (ds1.type == "number" && ds2.type == "array") {
            function lstMaxNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data = Math.max(lst[i].data, ds2.data);
                    if (lst[i].type == "array")
                        lst[i].data = lstMaxNum([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds2.type, lstMaxNum([...ds2.data]))] };
        }
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["min"] = new BlockMould("min", { "English": "min", "Chinese": "最小值" }, "data", "min", "sys_lib_math", { width: 2, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "number" && ds2.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.min(ds1.data, ds2.data))] };
        else if (ds1.type == "array" && ds2.type == "number") {
            function lstMinNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data = Math.min(lst[i].data, ds2.data);
                    if (lst[i].type == "array")
                        lst[i].data = lstMinNum([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lstMinNum([...ds1.data]))] };
        } else if (ds1.type == "array" && ds2.type == "number") {
            function lstMinNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data = Math.min(lst[i].data, ds2.data);
                    if (lst[i].type == "array")
                        lst[i].data = lstMinNum([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds2.type, lstMinNum([...ds2.data]))] };
        }
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["abs"] = new BlockMould("abs", { "English": "abs", "Chinese": "绝对值" }, "data", "abs", "sys_lib_math", { width: 1, height: 1 }, 0, 0, 1, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        if (ds1.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.abs(ds1.data))] };
        else if (ds1.type == "array") {
            function lstAbs(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data = Math.abs(lst[i].data);
                    if (lst[i].type == "array")
                        lst[i].data = lstAbs([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lstAbs([...ds1.data]))] };
        }
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["sqrt"] = new BlockMould("sqrt", { "English": "sqrt", "Chinese": "开根" }, "data", "sqrt", "sys_lib_math", { width: 1, height: 1 }, 0, 0, 1, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        if (ds1.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.sqrt(ds1.data))] };
        else if (ds1.type == "array") {
            function lstSqrt(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data = Math.sqrt(lst[i].data);
                    if (lst[i].type == "array")
                        lst[i].data = lstSqrt([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lstSqrt([...ds1.data]))] };
        }
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["constant_e"] = new BlockMould("constant_e", { "English": "e", "Chinese": "e" }, "data", "constant_e", "sys_lib_math", { width: 1, height: 1 }, 0, 0, 0, 1, (innerInput, preDataStream, variableTables) => {
        return { logicport: -1, dataOutput: [new DataStream("number", Math.E)] };
    });

    math.BlockMoulds["exp"] = new BlockMould("exp", { "English": "exp", "Chinese": "exp" }, "data", "exp", "sys_lib_math", { width: 1, height: 1 }, 0, 0, 1, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        if (ds1.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.exp(ds1.data))] };
        else if (ds1.type == "array") {
            function lstExp(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data = Math.exp(lst[i].data);
                    if (lst[i].type == "array")
                        lst[i].data = lstExp([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lstExp([...ds1.data]))] };
        }
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["pow"] = new BlockMould("pow", { "English": "pow", "Chinese": "次方" }, "data", "pow", "sys_lib_math", { width: 1, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "number" && ds2.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.pow(ds1.data, ds2.data))] };
        else if (ds1.type == "array" && ds2.type == "number") {
            function lstPowNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data = Math.pow(lst[i].data, ds2.data);
                    if (lst[i].type == "array")
                        lst[i].data = lstPowNum([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lstPowNum([...ds1.data]))] };
        } else if (ds1.type == "array" && ds2.type == "number") {
            function lstPowNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data = Math.pow(ds1.data, lst[i].data);
                    if (lst[i].type == "array")
                        lst[i].data = lstPowNum([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds2.type, lstPowNum([...ds2.data]))] };
        }
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["ln"] = new BlockMould("ln", { "English": "ln", "Chinese": "ln" }, "data", "ln", "sys_lib_math", { width: 1, height: 1 }, 0, 0, 1, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        if (ds1.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.log(ds1.data))] };
        else if (ds1.type == "array") {
            function lstIn(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data = Math.ln(lst[i].data);
                    if (lst[i].type == "array")
                        lst[i].data = lstIn([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lstIn([...ds1.data]))] };
        }
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["log"] = new BlockMould("log", { "English": "log", "Chinese": "log" }, "data", "log", "sys_lib_math", { width: 1, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "number" && ds2.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.log(ds1.data) / Math.log(ds2.data))] };
        else if (ds1.type == "array" && ds2.type == "number") {
            function lstLogNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data = Math.log(lst[i].data, ds2.data);
                    if (lst[i].type == "array")
                        lst[i].data = lstLogNum([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lstLogNum([...ds1.data]))] };
        } else if (ds1.type == "number" && ds2.type == "array") {
            function lstLogNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data = Math.log(ds1.data, lst[i].data);
                    if (lst[i].type == "array")
                        lst[i].data = lstLogNum([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds2.type, lstLogNum([...ds2.data]))] };
        }
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["b_not"] = new BlockMould("b_not", { "English": "B NOT", "Chinese": "位非" }, "data", "b_not", "sys_lib_math", { width: 2, height: 1 }, 0, 0, 1, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        if (ds1.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, ~ds1.data)] };
        else if (ds1.type == "array") {
            function lstBnot(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data = ~lst[i].data;
                    if (lst[i].type == "array")
                        lst[i].data = lstBnot([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lstBnot([...ds1.data]))] };
        }
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["b_and"] = new BlockMould("b_and", { "English": "B AND", "Chinese": "位与" }, "data", "b_and", "sys_lib_math", { width: 2, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "number" && ds2.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, ds1.data & ds2.data)] };
        else if (ds1.type == "array" && ds2.type == "number") {
            function lstBandNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data = lst[i].data & ds2.data;
                    if (lst[i].type == "array")
                        lst[i].data = lstBandNum([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lstBandNum([...ds1.data]))] };
        } else if (ds1.type == "number" && ds2.type == "array") {
            function lstBandNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data = lst[i].data & ds2.data;
                    if (lst[i].type == "array")
                        lst[i].data = lstBandNum([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds2.type, lstBandNum([...ds2.data]))] };
        }
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["b_or"] = new BlockMould("b_or", { "English": "B OR", "Chinese": "位或" }, "data", "b_or", "sys_lib_math", { width: 2, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "number" && ds2.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, ds1.data | ds2.data)] };
        else if (ds1.type == "array" && ds2.type == "number") {
            function lstBorNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data = lst[i].data | ds2.data;
                    if (lst[i].type == "array")
                        lst[i].data = lstBorNum([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lstBorNum([...ds1.data]))] };
        } else if (ds1.type == "number" && ds2.type == "array") {
            function lstBorNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data = lst[i].data | ds2.data;
                    if (lst[i].type == "array")
                        lst[i].data = lstBorNum([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds2.type, lstBorNum([...ds2.data]))] };
        }
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["b_xor"] = new BlockMould("b_xor", { "English": "B XOR", "Chinese": "位异或" }, "data", "b_xor", "sys_lib_math", { width: 2, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "number" && ds2.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, ds1.data ^ ds2.data)] };
        else if (ds1.type == "array" && ds2.type == "number") {
            function lstBxorNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data = lst[i].data ^ ds2.data;
                    if (lst[i].type == "array")
                        lst[i].data = lstBxorNum([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lstBxorNum([...ds1.data]))] };
        } else if (ds1.type == "number" && ds2.type == "array") {
            function lstBxorNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data = lst[i].data ^ ds2.data;
                    if (lst[i].type == "array")
                        lst[i].data = lstBxorNum([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds2.type, lstBxorNum([...ds2.data]))] };
        }
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["SHL"] = new BlockMould("SHL", { "English": "SHL", "Chinese": "左移" }, "data", "SHL", "sys_lib_math", { width: 1, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "number" && ds2.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, ds1.data << ds2.data)] };
        else if (ds1.type == "array" && ds2.type == "number") {
            function lstSHLNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data = lst[i].data << ds2.data;
                    if (lst[i].type == "array")
                        lst[i].data = lstSHLNum([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lstSHLNum([...ds1.data]))] };
        } else if (ds1.type == "number" && ds2.type == "array") {
            function lstSHLNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data = ds1.data << lst[i].data;
                    if (lst[i].type == "array")
                        lst[i].data = lstSHLNum([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds2.type, lstSHLNum([...ds2.data]))] };
        }
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["SHR"] = new BlockMould("SHR", { "English": "SHR", "Chinese": "右移" }, "data", "SHR", "sys_lib_math", { width: 1, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "number" && ds2.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, ds1.data >> ds2.data)] };
        else if (ds1.type == "array" && ds2.type == "number") {
            function lstSHRNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data = lst[i].data >> ds2.data;
                    if (lst[i].type == "array")
                        lst[i].data = lstSHRNum([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lstSHRNum([...ds1.data]))] };
        } else if (ds1.type == "array" && ds2.type == "number") {
            function lstSHRNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data = ds1.data >> lst[i].data;
                    if (lst[i].type == "array")
                        lst[i].data = lstSHRNum([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds2.type, lstSHRNum([...ds2.data]))] };
        }
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["constant_pi"] = new BlockMould("constant_pi", { "English": "π", "Chinese": "π" }, "data", "constant_pi", "sys_lib_math", { width: 1, height: 1 }, 0, 0, 0, 1, (innerInput, preDataStream, variableTables) => {
        return { logicport: -1, dataOutput: [new DataStream("number", Math.PI)] };
    });

    math.BlockMoulds["sin"] = new BlockMould("sin", { "English": "sin", "Chinese": "sin" }, "data", "sin", "sys_lib_math", { width: 1, height: 1 }, 0, 0, 1, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        if (ds1.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.sin(ds1.data))] };
        else if (ds1.type == "array") {
            function lstSin(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data = Math.sin(lst[i].data);
                    if (lst[i].type == "array")
                        lst[i].data = lstSin([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lstSin([...ds1.data]))] };
        }
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["cos"] = new BlockMould("cos", { "English": "cos", "Chinese": "cos" }, "data", "cos", "sys_lib_math", { width: 1, height: 1 }, 0, 0, 1, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        if (ds1.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.cos(ds1.data))] };
        else if (ds1.type == "array") {
            function lstCos(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data = Math.cos(lst[i].data);
                    if (lst[i].type == "array")
                        lst[i].data = lstCos([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lstCos([...ds1.data]))] };
        }
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["tan"] = new BlockMould("tan", { "English": "tan", "Chinese": "tan" }, "data", "tan", "sys_lib_math", { width: 1, height: 1 }, 0, 0, 1, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        if (ds1.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.tan(ds1.data))] };
        else if (ds1.type == "array") {
            function lstTan(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data = Math.tan(lst[i].data);
                    if (lst[i].type == "array")
                        lst[i].data = lstTan([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lstTan([...ds1.data]))] };
        }
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["asin"] = new BlockMould("asin", { "English": "asin", "Chinese": "asin" }, "data", "asin", "sys_lib_math", { width: 1, height: 1 }, 0, 0, 1, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        if (ds1.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.asin(ds1.data))] };
        else if (ds1.type == "array") {
            function lstAsin(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data = Math.asin(lst[i].data);
                    if (lst[i].type == "array")
                        lst[i].data = lstAsin([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lstAsin([...ds1.data]))] };
        }
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["acos"] = new BlockMould("acos", { "English": "acos", "Chinese": "acos" }, "data", "acos", "sys_lib_math", { width: 1, height: 1 }, 0, 0, 1, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        if (ds1.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.acos(ds1.data))] };
        else if (ds1.type == "array") {
            function lstAcos(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data = Math.acos(lst[i].data);
                    if (lst[i].type == "array")
                        lst[i].data = lstAcos([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lstAcos([...ds1.data]))] };
        }
        return { logicport: -1, dataOutput: [new DataStream()] };
    });

    math.BlockMoulds["atan"] = new BlockMould("atan", { "English": "atan", "Chinese": "atan" }, "data", "atan", "sys_lib_math", { width: 1, height: 1 }, 0, 0, 1, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        if (ds1.type == "number")
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, Math.atan(ds1.data))] };
        else if (ds1.type == "array") {
            function lstAtan(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "number")
                        lst[i].data = Math.atan(lst[i].data);
                    if (lst[i].type == "array")
                        lst[i].data = lstAtan([...lst[i].data]);
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lstAtan([...ds1.data]))] };
        }
        return { logicport: -1, dataOutput: [new DataStream()] };
    });
    return math;
}

function formLogic() {
    let logic = new BlockLibrary("sys_lib_logic", { "English": "Logic", "Chinese": "逻辑指令" }, "#2c9678");

    logic.BlockMoulds["and"] = new BlockMould("and", { "English": "and", "Chinese": "与" }, "data", "and", "sys_lib_logic", { width: 1, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "array") {
            function lstAndNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "array")
                        lst[i].data = lstAndNum([...lst[i].data]);
                    else {
                        lst[i].type = "boolean";
                        lst[i].data = (lst[i].data && ds2.data) ? true : false;
                    }
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lstAndNum([...ds1.data]))] };
        } else if (ds2.type == "array") {
            function lstAndNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "array")
                        lst[i].data = lstAndNum([...lst[i].data]);
                    else {
                        lst[i].type = "boolean";
                        lst[i].data = (lst[i].data && ds1.data) ? true : false;
                    }
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds2.type, lstAndNum([...ds2.data]))] };
        }
        return { logicport: -1, dataOutput: [new DataStream("boolean", (ds1.data && ds2.data) ? true : false)] };
    });


    logic.BlockMoulds["or"] = new BlockMould("or", { "English": "or", "Chinese": "或" }, "data", "or", "sys_lib_logic", { width: 1, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "array") {
            function lstOrNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "array")
                        lst[i].data = lstOrNum([...lst[i].data]);
                    else {
                        lst[i].type = "boolean";
                        lst[i].data = (lst[i].data || ds2.data) ? true : false;
                    }
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lstOrNum([...ds1.data]))] };
        } else if (ds2.type == "array") {
            function lstOrNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "array")
                        lst[i].data = lstOrNum([...lst[i].data]);
                    else {
                        lst[i].type = "boolean";
                        lst[i].data = (lst[i].data || ds1.data) ? true : false;
                    }
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds2.type, lstOrNum([...ds2.data]))] };
        }
        return { logicport: -1, dataOutput: [new DataStream("boolean", (ds1.data || ds2.data) ? true : false)] };
    });


    logic.BlockMoulds["not"] = new BlockMould("not", { "English": "not", "Chinese": "非" }, "data", "not", "sys_lib_logic", { width: 1, height: 1 }, 0, 0, 1, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        if (ds1.type == "array") {
            function lstNot(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "array")
                        lst[i].data = lstNot([...lst[i].data]);
                    else {
                        lst[i].type = "boolean";
                        lst[i].data = (!lst[i].data) ? true : false;
                    }
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lstNot([...ds1.data]))] };
        }
        return { logicport: -1, dataOutput: [new DataStream("boolean", (!ds1.data) ? true : false)] };
    });

    logic.BlockMoulds["equal"] = new BlockMould("equal", { "English": "equal", "Chinese": "等于" }, "data", "equal", "sys_lib_logic", { width: 2, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "array") {
            function lstEqualNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "array")
                        lst[i].data = lstEqualNum([...lst[i].data]);
                    else {
                        lst[i].type = "boolean";
                        lst[i].data = (lst[i].data == ds2.data) ? true : false;
                    }
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lstEqualNum([...ds1.data]))] };
        } else if (ds2.type == "array") {
            function lstEqualNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "array")
                        lst[i].data = lstEqualNum([...lst[i].data]);
                    else {
                        lst[i].type = "boolean";
                        lst[i].data = (lst[i].data == ds1.data) ? true : false;
                    }
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds2.type, lstEqualNum([...ds2.data]))] };
        }
        return { logicport: -1, dataOutput: [new DataStream("boolean", (ds1.data == ds2.data) ? true : false)] };
    });

    logic.BlockMoulds["unequal"] = new BlockMould("unequal", { "English": "unequal", "Chinese": "不等于" }, "data", "unequal", "sys_lib_logic", { width: 2, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "array") {
            function lstUnequalNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "array")
                        lst[i].data = lstUnequalNum([...lst[i].data]);
                    else {
                        lst[i].type = "boolean";
                        lst[i].data = (lst[i].data != ds2.data) ? true : false;
                    }
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lstUnequalNum([...ds1.data]))] };
        } else if (ds2.type == "array") {
            function lstUnequalNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "array")
                        lst[i].data = lstUnequalNum([...lst[i].data]);
                    else {
                        lst[i].type = "boolean";
                        lst[i].data = (lst[i].data != ds1.data) ? true : false;
                    }
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds2.type, lstUnequalNum([...ds2.data]))] };
        }
        return { logicport: -1, dataOutput: [new DataStream("boolean", (ds1.data != ds2.data) ? true : false)] };
    });

    logic.BlockMoulds["greater"] = new BlockMould("greater", { "English": "greater", "Chinese": "大于" }, "data", "greater", "sys_lib_logic", { width: 2, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "array") {
            function lstGreaterNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "array")
                        lst[i].data = lstGreaterNum([...lst[i].data]);
                    else {
                        lst[i].type = "boolean";
                        lst[i].data = (lst[i].data > ds2.data) ? true : false;
                    }
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lstGreaterNum([...ds1.data]))] };
        } else if (ds2.type == "array") {
            function lstGreaterNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "array")
                        lst[i].data = lstGreaterNum([...lst[i].data]);
                    else {
                        lst[i].type = "boolean";
                        lst[i].data = (ds1.data > lst[i].data) ? true : false;
                    }
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds2.type, lstGreaterNum([...ds2.data]))] };
        }
        return { logicport: -1, dataOutput: [new DataStream("boolean", (ds1.data > ds2.data) ? true : false)] };
    });

    logic.BlockMoulds["egreater"] = new BlockMould("egreater", { "English": "eq-greater", "Chinese": "大于等于" }, "data", "egreater", "sys_lib_logic", { width: 2, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "array") {
            function lstEgreaterNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "array")
                        lst[i].data = lstEgreaterNum([...lst[i].data]);
                    else {
                        lst[i].type = "boolean";
                        lst[i].data = (lst[i].data >= ds2.data) ? true : false;
                    }
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lstEgreaterNum([...ds1.data]))] };
        } else if (ds2.type == "array") {
            function lstEgreaterNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "array")
                        lst[i].data = lstEgreaterNum([...lst[i].data]);
                    else {
                        lst[i].type = "boolean";
                        lst[i].data = (ds1.data >= lst[i].data) ? true : false;
                    }
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds2.type, lstEgreaterNum([...ds2.data]))] };
        }
        return { logicport: -1, dataOutput: [new DataStream("boolean", (ds1.data >= ds2.data) ? true : false)] };
    });

    logic.BlockMoulds["less"] = new BlockMould("less", { "English": "less", "Chinese": "小于" }, "data", "less", "sys_lib_logic", { width: 2, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "array") {
            function lstLessNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "array")
                        lst[i].data = lstLessNum([...lst[i].data]);
                    else {
                        lst[i].type = "boolean";
                        lst[i].data = (lst[i].data < ds2.data) ? true : false;
                    }
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lstLessNum([...ds1.data]))] };
        } else if (ds2.type == "array") {
            function lstLessNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "array")
                        lst[i].data = lstLessNum([...lst[i].data]);
                    else {
                        lst[i].type = "boolean";
                        lst[i].data = (ds1.data < lst[i].data) ? true : false;
                    }
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds2.type, lstLessNum([...ds2.data]))] };
        }
        return { logicport: -1, dataOutput: [new DataStream("boolean", (ds1.data < ds2.data) ? true : false)] };
    });

    logic.BlockMoulds["eless"] = new BlockMould("eless", { "English": "eq-less", "Chinese": "小于等于" }, "data", "eless", "sys_lib_logic", { width: 2, height: 2 }, 0, 0, 2, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        let ds2 = preDataStream[1].readData(variableTables).duplicate();
        if (ds1.type == "array") {
            function lstElessNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "array")
                        lst[i].data = lstElessNum([...lst[i].data]);
                    else {
                        lst[i].type = "boolean";
                        lst[i].data = (lst[i].data <= ds2.data) ? true : false;
                    }
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds1.type, lstElessNum([...ds1.data]))] };
        } else if (ds2.type == "array") {
            function lstElessNum(lst) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].type == "array")
                        lst[i].data = lstElessNum([...lst[i].data]);
                    else {
                        lst[i].type = "boolean";
                        lst[i].data = (ds1.data <= lst[i].data) ? true : false;
                    }
                }
                return lst;
            }
            return { logicport: -1, dataOutput: [new DataStream(ds2.type, lstElessNum([...ds2.data]))] };
        }
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

    array.BlockMoulds["length"] = new BlockMould("length", { "English": "length", "Chinese": "数列长度" }, "data", "length", "sys_lib_array", { width: 2, height: 1 }, 0, 0, 1, 1, (innerInput, preDataStream, variableTables) => {
        let ds1 = preDataStream[0].readData(variableTables).duplicate();
        if (ds1.type == "array")
            return { logicport: -1, dataOutput: [new DataStream("number", ds1.data.length)] };
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