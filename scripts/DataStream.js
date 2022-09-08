import VariableTable from "./VariableTable.js";

export default class DataStream {
    constructor(type = "null", data = null) {
        this.type = type;
        this.data = data;
    }

    readData() {
        if (this.type == "variable")
            return VariableTable.readVariable(this.data);
        return this.data;
    }

    read(str) {
        if (str == "null") {
            this.type = "null";
            this.data = null;
            return;
        }
        if (str == "true") {
            this.type = "boolean";
            this.data = true;
            return;
        }
        if (str == "false") {
            this.type = "boolean";
            this.data = false;
            return;
        }
        if (str[0] == "\"" && str[str.length - 1] == "\"") {
            this.type = "string";
            this.data = str.substr(1, str.length - 2);
            return;
        }
        if (str[0] >= "0" && str[0] <= "9" || str[0] == '.') {
            this.type = "number";
            this.data = parseFloat(str);
            return;
        }
        this.type = "variable";
        this.data = str;
        return;
    }
}