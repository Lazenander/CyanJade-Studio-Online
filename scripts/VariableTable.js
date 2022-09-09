import ErrorManager from "./ErrorManager.js";

export default class VariableTable {
    static instance = new VariableTable();

    constructor() {
        this._storage = {};
    }

    clearVariableTable() {
        this._storage = {};
    }

    assignVariable(variable, data) {
        if (variable.type != "variable") {
            ErrorManager.error(1, variable.data);
            return;
        }
        this._storage[variable.data] = data.readData();
    }

    changeVariable(variable, data) {
        if (variable.type != "variable") {
            ErrorManager.error(2, variable.data);
            return;
        }
        this._storage[variable.data] = data.readData();
    }

    readVariable(variable) {
        if (variable.type != "variable") {
            ErrorManager.error(3, variable.data);
            return;
        }
        return this._storage[variable.data];
    }
}