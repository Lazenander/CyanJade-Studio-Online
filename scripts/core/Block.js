import { formArray } from "../../modules/numjs/ArrayOperations";

export default class Block {
    constructor(id, blockMould) {
        this.id = id;
        this.blockMould = blockMould;
        this.logicImports = formArray(blockMould.logicImportNum, []);
        this.logicExports = formArray(blockMould.logicExportNum, []);
        this.dataImports = formArray(blockMould.dataImportNum, 0);
        this.dataExports = formArray(blockMould.dataExportNum, []);
    }
}