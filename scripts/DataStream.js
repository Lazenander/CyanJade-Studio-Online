import VariableTable from "./VariableTable.js";

export default class DataStream {
    constructor(type = "null", data = null) {
        this.type = type;
        this.data = data;
    }

    readData(variableTables) {
        if (this.type == "variable") {
            for (let i = variableTables.length - 1; i >= 0; i--)
                if (variableTables[i].existVariable(this))
                    return variableTables[i].readVariable(this);
            ErrorManager.error(3, variable.data);
            return this;
        }
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
        function cutSpace(s) {
            while (s[0] == " ")
                s = s.slice(1);
            while (s[s.length - 1] == " ")
                s = s.slice(0, s.length - 1);
            return s;
        }

        str = cutSpace(str);

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
            return;
        } else if (str[0] == "[" && str[str.length - 1] == "]") {
            this.type = "array";
            this.data = [];
            let tmpstr = "";
            let br = 0;
            for (let i = 1; i < str.length - 1; i++) {
                if (str[i] == "[")
                    br++;
                if (str[i] == "]")
                    br--;
                if (str[i] == "," && br == 0) {
                    let tmpDS = new DataStream();
                    tmpDS.read(tmpstr)
                    this.data.push(tmpDS);
                    tmpstr = "";
                } else if (str[i])
                    tmpstr += str[i];
            }
            let tmpDS = new DataStream();
            tmpDS.read(tmpstr)
            this.data.push(tmpDS);
            return;
        } else if (this.isVariable(str.split('[')[0])) {
            this.type = "variableArrayElement";
            this.data = { name: str.split('[')[0], address: [] };
            let tmpstr = "";
            let flag = false;
            let br = 0;
            for (let i = str.split('[')[0].length; i < str.length; i++) {
                if (str[i] == "[")
                    br++;
                if (str[i] == "]")
                    br--;
                tmpstr += str[i];
                if (br == 0) {
                    let tmpDS = new DataStream();
                    tmpDS.read(tmpstr.slice(1, tmpstr.length - 1));
                    this.data.address.push(tmpDS);
                    tmpstr = "";
                }
            }
            for (let i = 0; i < this.data.address.length; i++)
                console.log(this.data.address[i]);
            return;
        }
        this.type = "unknown";
        this.data = str;
        return;
    }

    toString() {
        switch (this.type) {
            case "string":
                return "\"" + this.data + "\"";
            case "variable":
                return "" + this.data;
            case "number":
                return "" + Math.round(this.data * 1e6) / 1e6;
            case "boolean":
                return "" + this.data;
            case "unknown":
                return "" + this.data;
            case "array":
                let str = "[";
                for (let i = 0; i < this.data.length; i++) {
                    str += this.data[i].toString();
                    if (i != this.data.length - 1)
                        str += ", ";
                }
                str += "]";
                return str;
            default:
                return "" + this.data
        }
    }
}