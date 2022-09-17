import VariableTable from "./VariableTable.js";

export default class DataStream {
    constructor(type = "null", data = null) {
        this.type = type;
        this.data = data;
    }

    readData() {
        if (this.type == "variable")
            return VariableTable.instance.readVariable(this);
        return this;
    }

    read(str) {
        if (str == "null" || str == "") {
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
        console.log(str, str[0], str[str.length - 1])
        if (str[0] == "\"" && str[str.length - 1] == "\"" || str[0] == "\'" && str[str.length - 1] == "\'") {
            this.type = "string";
            this.data = str.substr(1, str.length - 2);
            return;
        }
        if (str[0] >= "0" && str[0] <= "9" || str[0] == '.' || str[0] == '-' && str[1] >= "0" && str[1] <= "9") {
            this.type = "number";
            this.data = parseFloat(str);
            return;
        }
        this.type = "variable";
        this.data = str;
        return;
    }
}