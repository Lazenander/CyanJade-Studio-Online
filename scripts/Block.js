export default class Block {
    constructor(index, x, y, blockMould) {
        this.index = index;
        this.x = x;
        this.y = y;
        this.blockMould = blockMould;
        this.logicImports = [];
        this.logicExports = [];
        this.dataImports = [];
        this.dataExports = [];
        for (let i = 0; i < blockMould.logicImportNum; i++)
            this.logicImports.push([]);
        for (let i = 0; i < blockMould.logicExportNum; i++)
            this.logicExports.push([]);
        for (let i = 0; i < blockMould.dataImportNum; i++)
            this.dataImports.push(-1);
        for (let i = 0; i < blockMould.dataExportNum; i++)
            this.dataExports.push([]);
    }

    searchLogicImport(index) {
        for (let i = 0; i < this.blockMould.logicImportNum; i++)
            if (this.logicImports[i].indexOf(index) != -1)
                return i;
        index = parseInt(index);
        for (let i = 0; i < this.blockMould.logicImportNum; i++)
            if (this.logicImports[i].indexOf(index) != -1)
                return i;
        return -1;
    }

    searchLogicExport(index) {
        for (let i = 0; i < this.blockMould.logicExportNum; i++)
            if (this.logicExports[i].indexOf(index) != -1)
                return i;
        index = parseInt(index);
        for (let i = 0; i < this.blockMould.logicExportNum; i++)
            if (this.logicExports[i].indexOf(index) != -1)
                return i;
        return -1;
    }

    searchDataImport(index) {
        for (let i = 0; i < this.blockMould.dataImportNum; i++)
            if (this.dataImports[i] == index)
                return i;
        index = parseInt(index);
        for (let i = 0; i < this.blockMould.dataImportNum; i++)
            if (this.dataImports[i] == index)
                return i;
        return -1;
    }

    searchDataExport(index) {
        for (let i = 0; i < this.blockMould.dataExportNum; i++)
            if (this.dataExports[i].indexOf(index) != -1)
                return i;
        index = parseInt(index);
        for (let i = 0; i < this.blockMould.dataExportNum; i++)
            if (this.dataExports[i].indexOf(index) != -1)
                return i;
        return -1;
    }
}