import VariableTable from "./VariableTable.js";

export default class DataStream {
    constructor(type = "null", data = null) {
        this.type = type;
        this.data = data;
    }

    readData(variableTables) {
        if (this.type == "variable") {
            for (let i = variableTables.length - 1; i >= 0; i--)
                if (variableTables[i].existVariable(this)) {
                    let vdata = variableTables[i].readVariable(this);
                    if (vdata.type == "array") {
                        let res = new DataStream("array", []);
                        for (let j = 0; j < vdata.data.length; j++)
                            res.data.push(vdata.data[j].readData(variableTables));
                        console.log(res, vdata);
                        return res.duplicate();
                    }
                    return vdata.duplicate();
                }
            ErrorManager.error(3, this.data);
            return new DataStream(this.type, this.data);
        } else if (this.type == "variableArrayElement") {
            for (let i = variableTables.length - 1; i >= 0; i--)
                if (variableTables[i].existVariable(this)) {
                    let vdata = variableTables[i].readVariable(this);
                    if (vdata.type == "array") {
                        let res = new DataStream("array", []);
                        for (let j = 0; j < vdata.data.length; j++)
                            res.data.push(vdata.data[j].readData(variableTables));
                        return res.duplicate();
                    }
                    return vdata.duplicate();
                }
            ErrorManager.error(3, this.data);
            return new DataStream(this.type, this.data);
        } else if (this.type == "array") {
            console.log("02", this.data);
            let res = new DataStream("array", []);
            for (let j = 0; j < this.data.length; j++)
                res.data.push(this.data[j].readData(variableTables));
            console.log("-1-", res, this.data);
            return res.duplicate();
        }
        return new DataStream(this.type, this.data);
    }

    isNumber(str) {
        return !isNaN(str);
    }

    isVariable(str) {
        if (!(str[0] == "_" || str[0] >= "A" && str[0] <= "Z" || str[0] >= "a" && str[0] <= "z" || str.charCodeAt(0) >= 128))
            return false;
        for (let i = 1; i < str.length; i++)
            if (!(str[i] == "_" || str[i] >= "A" && str[i] <= "Z" || str[i] >= "a" && str[i] <= "z" || str[i] >= "0" && str[i] <= "9" || str.charCodeAt(i) >= 128))
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
        } else if (str == "true" || str == "真") {
            this.type = "boolean";
            this.data = true;
            return;
        } else if (str == "false" || str == "假") {
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
            let isInString = false;
            if (str.length != 2) {
                for (let i = 1; i < str.length - 1; i++) {
                    if ((str[i] == "\"" || str[i] == "\'") && str[i - 1] != "\\")
                        isInString = isInString ? false : true;
                    console.log(str[i], str[i - 1], str[i] == "\"" || str[i] == "\'", isInString);
                    if (isInString)
                        continue;
                    if (str[i] == "[")
                        br++;
                    if (str[i] == "]")
                        br--;
                    if (str[i] == "," && br == 0) {
                        let tmpDS = new DataStream();
                        tmpDS.read(tmpstr);
                        console.log("a", tmpDS);
                        this.data.push(tmpDS);
                        tmpstr = "";
                    } else if (str[i])
                        tmpstr += str[i];
                }
                let tmpDS = new DataStream();
                tmpDS.read(tmpstr);
                this.data.push(tmpDS);
            }
            console.log("123:", this.data, this.data[0].data, this.data[0].type);
            return;
        } else if (this.isVariable(str.split('[')[0])) {
            this.type = "variableArrayElement";
            this.data = { name: str.split('[')[0], address: [] };
            let tmpstr = "";
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
                let strNum = "" + this.data;
                console.log(strNum);
                if (strNum.includes("e+")) {
                    let tmpstr = "" + strNum.split("e+")[0];
                    let num = parseInt("" + strNum.split("e+")[1]);
                    if (tmpstr.split(".").length == 2)
                        tmpstr = "" + tmpstr.split(".")[0] + tmpstr.split(".")[1];
                    while (tmpstr.length < num + 1)
                        tmpstr += "0";
                    return tmpstr;
                } else if (strNum.includes("e-")) {
                    let tmpstr = strNum.split("e-")[0];
                    let num = parseInt(strNum.split("e-")[1]);
                    let tmpstr2 = "";
                    while (tmpstr2.length < num - 1)
                        tmpstr2 += "0";
                    return "0." + tmpstr2 + tmpstr.split(".")[0] + tmpstr.split(".")[1];
                } else
                    return strNum;
            case "boolean":
                return "" + this.data;
            case "unknown":
                return "" + this.data;
            case "array":
                let str = "[";
                console.log(this.data, this.data.length);
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

    duplicate() {
        return new DataStream(this.type, this.data);
    }
}