import BlockMould from "./BlockMould.js";
import DataStream from "./DataStream.js";
import LanguageManager from "./language.js";

export default class BlockLibrary {
    constructor(nameID = "", Tnames = { "English": "", "Chinese": "" }, color = "#2c9678") {
        this.nameID = nameID;
        LanguageManager.addPhrase(this.nameID, Tnames);
        this.color = color;
        this.BlockMoulds = {};
    }

    addNewMould(nameID) {
        this.BlockMoulds[nameID] = new BlockMould(nameID, { "English": "New Mould " + nameID, "Chinese": "新模块" + nameID }, "data", "userDefData", this.nameID, { width: 1, height: 1 }, 0, 0, 0, 1, (innerInput, preDataStream, variableTables) => {
            return {
                logicport: 0,
                dataOutput: [new DataStream()]
            };
        });
    }

    importLib(str) {};
    exportLib() {};
}