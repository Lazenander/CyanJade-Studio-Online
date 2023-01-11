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
            ErrorManager.error(1, { name: variable.data });
            return;
        }
        console.log("Assign var " + variable + ": " + data);
        this._storage[variable.data] = data.readData([this]);
        console.log(this._storage[variable.data]);
    }

    changeVariable(variable, data) {
        if (variable.type == "variable")
            this._storage[variable.data] = data.readData([this]);
        else if (variable.type == "variableArrayElement") {
            let currentData = this._storage[variable.data.name];
            for (let i = 0; i < variable.data.address.length - 1; i++)
                currentData = currentData.data[variable.data.address[i]];
            currentData.data[variable.data.address[variable.data.address.length - 1]] = data.readData([this]);
        } else
            ErrorManager.error(2, { name: variable.data });
        return;
    }

    readVariable(variable) {
        if (variable.type == "variable")
            return this._storage[variable.data];
        else if (variable.type == "variableArrayElement") {
            let currentData = this._storage[variable.data.name];
            for (let i = 0; i < variable.data.address.length; i++) {
                switch (variable.data.address[i].type) {
                    case "number":
                        currentData = currentData.data[variable.data.address[i].data];
                        break;
                    case "variable":
                        currentData = currentData.data[this.readVariable(variable.data.address[i])];
                        break;
                    case "variableArrayElement":
                        currentData = currentData.data[this.readVariable(variable.data.address[i])];
                        break;
                    default:
                        ErrorManager.error(3, { name: variable.data });
                        return;
                }
            }
            return currentData;
        }
        ErrorManager.error(3, variable.data);
        return;
    }

    existVariable(variable) {
        if (variable.type != "variable" && variable.type != "variableArrayElement") {
            ErrorManager.error(4, { name: variable.data });
            return;
        }
        if (variable.type == "variable")
            return variable.data in this._storage;
        if (variable.type == "variableArrayElement")
            return variable.data.name in this._storage;
    }
}