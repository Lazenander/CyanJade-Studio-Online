import VariableTable from "./VariableTable";

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
}