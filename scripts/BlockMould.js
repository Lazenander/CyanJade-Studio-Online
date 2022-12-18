import LanguageManager from "./language.js";

export default class BlockMould {
    constructor(nameID, Tnames, generalType, type, lib, size, logicImportNum, logicExportNum, dataImportNum, dataExportNum, forward) {
        this.nameID = nameID;
        this.Tnames = Tnames;
        LanguageManager.addPhrase(lib + "_" + this.nameID, Tnames);
        this.generalType = generalType;
        this.type = type;
        this.lib = lib;
        this.size = size;
        this.logicImportNum = logicImportNum;
        this.logicExportNum = logicExportNum;
        this.dataImportNum = dataImportNum;
        this.dataExportNum = dataExportNum;
        this.codeManager = null;
        this.forward = forward;
    }
}