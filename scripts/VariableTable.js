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
        console.log("Assign var " + variable + ": " + data);
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
        if (variable.type == "variable")
            return this._storage[variable.data];
        else if (variable.type == "variableArrayElement") {
            console.log(variable.data);
            let currentData = this._storage[variable.data.name];
            console.log(this._storage);
            console.log(currentData);
            for (let i = 0; i < variable.data.address.length; i++) {
                console.log(variable.data.address[i]);
                switch (variable.data.address[i].type) {
                    case "number":
                        console.log(variable.data.address[i].data, currentData);
                        currentData = currentData.data[variable.data.address[i].data];
                        break;
                    case "variable":
                        currentData = currentData.data[this.readVariable(variable.data.address[i])];
                        console.log(currentData);
                        break;
                    case "variableArrayElement":
                        currentData = currentData.data[this.readVariable(variable.data.address[i])];
                        console.log(currentData);
                        break;
                    default:
                        ErrorManager.error(3, variable.data);
                        return;
                }
                console.log(currentData);
            }
            return currentData;
        }
        console.log(currentData);
        ErrorManager.error(3, variable.data);
        return;
    }

    existVariable(variable) {
        if (variable.type != "variable" && variable.type != "variableArrayElement") {
            ErrorManager.error(4, variable.data);
            return;
        }
        if (variable.type == "variable")
            return variable.data in this._storage;
        if (variable.type == "variableArrayElement")
            return variable.data.name in this._storage;
    }
}