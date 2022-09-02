import { formArray } from "../../modules/numjs/ArrayOperations";

export default class Block {
    constructor(index, x, y, blockMould) {
        this.index = index;
        this.x = x;
        this.y = y;
        this.blockMould = blockMould;
        this.logicImports = formArray(blockMould.logicImportNum, []);
        this.logicExports = formArray(blockMould.logicExportNum, []);
        this.dataImports = formArray(blockMould.dataImportNum, 0);
        this.dataExports = formArray(blockMould.dataExportNum, []);
    }

    render() {
        let div = document.createElement('div');
        div.id = "b" + this.index;
        div.classList.add("block");
        div.style.width = (this.blockMould.size.width + 1) * 50 + "px";
        div.style.height = (this.blockMould.size.height + 1) * 50 + "px";
        div.style.left = this.x * 50 + 25 + "px";
        div.style.top = this.y * 50 + 25 + "px";
        return div;
    }
}