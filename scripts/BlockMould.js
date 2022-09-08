import LanguageManager from "./language.js";

export default class BlockMould {
    constructor(nameID, Tnames, generalType, type, lib, size, logicImportNum, logicExportNum, dataImportNum, dataExportNum, forward) {
        this.nameID = nameID;
        LanguageManager.addPhrase(this.nameID, Tnames);
        this.generalType = generalType;
        this.type = type;
        this.lib = lib;
        this.size = size;
        this.logicImportNum = logicImportNum;
        this.logicExportNum = logicExportNum;
        this.dataImportNum = dataImportNum;
        this.dataExportNum = dataExportNum;
        this.forward = forward;
    }
}