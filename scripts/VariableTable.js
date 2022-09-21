import ErrorManager from "./ErrorManager.js";

export default class VariableTable {
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
        this._storage[variable.data] = data.readData([this]);
    }

    changeVariable(variable, data) {
        if (variable.type != "variable") {
            ErrorManager.error(2, variable.data);
            return;
        }
        this._storage[variable.data] = data.readData([this]);
    }

    readVariable(variable) {
        if (variable.type != "variable") {
            ErrorManager.error(3, variable.data);
            return;
        }
        console.log(variable.data, this._storage);
        return this._storage[variable.data];
    }

    existVariable(variable) {
        if (variable.type != "variable") {
            ErrorManager.error(4, variable.data);
            return;
        }
        console.log(variable.data, this._storage);
        return variable.data in this._storage;
    }
}