class Block {
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
}

export default class Graph {
    constructor() {
        this.blocks = {};
        this.emptyIndex = [];
        this.size = 0;
    }

    addBlock(blockMould, x, y) {
        let newIndex = this.size;
        if (this.emptyIndex.length != 0)
            newIndex = this.emptyIndex.pop();
        let newBlock = new Block(newIndex, x, y, blockMould);
        this.blocks[newIndex] = newBlock;
        this.size++;
        return newIndex;
    }

    delBlock(index) {
        delete this.blocks[index];
        this.emptyIndex.push(index);
        this.size--;
        return;
    }

    addLogicConnection(index1, port1, index2, port2) {
        this.blocks[index1].logicExports[port1].push(index2);
        this.blocks[index2].logicImports[port2].push(index1);
        console.log(`Add Logic Connection ${index1}, ${index2}, at port ${port1}, ${port2}`);
    }

    addDataConnection(index1, port1, index2, port2) {
        this.blocks[index1].dataExports[port1].push(index2);
        this.blocks[index2].dataImports[port2] = index1;
        console.log(`Add Data Connection ${index1}, ${index2}, at port ${port1}, ${port2}`);
    }

    checkRegion(index) {
        let q = [];
        for (let i = 0; i < this.blocks[index].blockMould.dataImportNum; i++)
            if (this.blocks[index].dataImports[i] != -1 && q.indexOf(this.blocks[index].dataImports[i]) == -1)
                q.push(this.blocks[index].dataImports[i]);
        for (let i = 0; i < this.blocks[index].blockMould.logicImportNum; i++)
            for (let j = 0; j < this.blocks[index].logicImports[i].length; j++)
                if (this.blocks[index].logicImports[i][j] != -1 && q.indexOf(this.blocks[index].logicImports[i][j]) == -1)
                    q.push(this.blocks[index].logicImports[i][j]);
        while (q.length != 0) {
            let tindex = q.shift();
            if (this.blocks[tindex].blockMould.type == "if")
                return tindex;
            for (let i = 0; i < this.blocks[tindex].blockMould.dataImportNum; i++)
                if (this.blocks[tindex].dataImports[i] != -1 && q.indexOf(this.blocks[tindex].dataImports[i]) == -1)
                    q.push(this.blocks[tindex].dataImports[i]);
            for (let i = 0; i < this.blocks[tindex].blockMould.logicImportNum; i++)
                for (let j = 0; j < this.blocks[tindex].logicImports[i].length; j++)
                    if (this.blocks[tindex].logicImports[i][j] != -1 && q.indexOf(this.blocks[tindex].logicImports[i][j]) == -1)
                        q.push(this.blocks[tindex].logicImports[i][j]);
        }
        return -1;
    }

    isConnectionAvailable(index1, index2, dataport = -1) {
        console.log(index1, index2);
        if (dataport != -1 && this.blocks[index2].dataImports[dataport] != -1)
            return false;
        for (let i = 0; i < this.blocks[index2].logicImports.length; i++)
            if (this.blocks[index2].logicImports.indexOf(index1) != -1)
                return false;
        for (let i = 0; i < this.blocks[index1].logicExports.length; i++)
            if (this.blocks[index1].logicExports.indexOf(index2) != -1)
                return false;
        for (let i = 0; i < this.blocks[index1].dataExports.length; i++)
            if (this.blocks[index1].dataExports.indexOf(index2) != -1)
                return false;
        if (this.checkRegion(index1) != this.checkRegion(index2))
            return false;
        let q = [];
        console.log(this.blocks[index1].logicImports, this.blocks[index1].dataImports);
        for (let i = 0; i < this.blocks[index1].blockMould.dataImportNum; i++)
            if (this.blocks[index1].dataImports[i] != -1 && q.indexOf(this.blocks[index1].dataImports[i]) == -1)
                q.push(this.blocks[index1].dataImports[i]);
        for (let i = 0; i < this.blocks[index1].blockMould.logicImportNum; i++)
            for (let j = 0; j < this.blocks[index1].logicImports[i].length; j++)
                if (this.blocks[index1].logicImports[i][j] != -1 && q.indexOf(this.blocks[index1].logicImports[i][j]) == -1)
                    q.push(this.blocks[index1].logicImports[i][j]);
        while (q.length != 0) {
            let tindex = q.shift();
            console.log(tindex);
            if (tindex == index2)
                return false;
            for (let i = 0; i < this.blocks[tindex].blockMould.dataImportNum; i++)
                if (this.blocks[tindex].dataImports[i] != -1 && q.indexOf(this.blocks[tindex].dataImports[i]) == -1)
                    q.push(this.blocks[tindex].dataImports[i]);
            q.push(this.blocks[tindex].dataImports[i][j]);
            for (let i = 0; i < this.blocks[tindex].blockMould.logicImportNum; i++)
                for (let j = 0; j < this.blocks[tindex].logicImports[i].length; j++)
                    if (this.blocks[tindex].logicImports[i][j] != -1 && q.indexOf(this.blocks[tindex].logicImports[i][j]) == -1)
                        q.push(this.blocks[tindex].logicImports[i][j]);
        }
        return true;
    }

    forward() {}
}