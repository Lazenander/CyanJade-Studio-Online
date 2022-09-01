import LanguageManager from "../language";

export default class BlockLibrary {
    constructor(nameID = "", Tnames = { "English": "", "Chinese": "" }, color = "") {
        this.nameID = nameID;
        LanguageManager.phrases[this.nameID] = Tnames;
        this.color = color;
        this.BlockMoulds = [];
    }

    importLib(str) {};
    exportLib() {};
}