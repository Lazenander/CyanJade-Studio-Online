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
        this.blocks[index1].logicExports[port1].append(index2);
        this.blocks[index2].logicImports[port2].append(index1);
    }

    forward() {}
}