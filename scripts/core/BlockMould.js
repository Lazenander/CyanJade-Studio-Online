export default class BlockMould {
    constructor(name, type, lib, size, logicImportNum, logicExportNum, dataImportNum, dataExportNum, forward) {
        this.name = name;
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