import Block from "./Block";

const blockArea = document.getElementById("blockArea");

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
        return;
    }

    delBlock(index) {
        delete this.blocks[index];
        this.emptyIndex.push(index);
        return;
    }

    addLogicConnection(index1, port1, index2, port2) {
        this.blocks[index1].logicExports[port1].append(index2);
        this.blocks[index2].logicImports[port2].append(index1);
    }

    render() {
        for (let block of this.blocks) {
            blockArea.appendChild(block.render());
        }
    }

    forward() {}
}