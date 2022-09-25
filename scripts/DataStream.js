import VariableTable from "./VariableTable.js";

export default class DataStream {
    constructor(type = "null", data = null) {
        this.type = type;
        this.data = data;
    }

    readData(variableTables) {
        if (this.type == "variable")
            for (let i = variableTables.length - 1; i >= 0; i--)
                if (variableTables[i].existVariable(this))
                    return variableTables[i].readVariable(this);
        return this;
    }

    isNumber(str) {
        return parseFloat(str).toString() == str;
    }

    isVariable(str) {
        if (!(str[0] == "_" || str[0] >= "A" && str[0] <= "Z" || str[0] >= "a" && str[0] <= "z"))
            return false;
        for (let i = 1; i < str.length; i++)
            if (!(str[i] == "_" || str[i] >= "A" && str[i] <= "Z" || str[i] >= "a" && str[i] <= "z" || str[i] >= "0" && str[i] <= "9"))
                return false;
        return true;
    }

    read(str) {
        if (str == "null" || str == "") {
            this.type = "null";
            this.data = null;
            return;
        } else if (str == "true") {
            this.type = "boolean";
            this.data = true;
            return;
        } else if (str == "false") {
            this.type = "boolean";
            this.data = false;
            return;
        } else if (str[0] == "\"" && str[str.length - 1] == "\"" || str[0] == "\'" && str[str.length - 1] == "\'") {
            this.type = "string";
            this.data = str.substr(1, str.length - 2);
            return;
        } else if (this.isNumber(str)) {
            this.type = "number";
            this.data = parseFloat(str);
            return;
        } else if (this.isVariable(str)) {
            this.type = "variable";
            this.data = str;
        } else {
            this.type = "null";
            this.data = null;
            return;
        }
        return;
    }
}