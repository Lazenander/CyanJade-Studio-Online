import LanguageManager from "../language.js";

export default class BlockLibrary {
    constructor(nameID = "", Tnames = { "English": "", "Chinese": "" }, color = "") {
        this.nameID = nameID;
        LanguageManager.addPhrase(this.nameID, Tnames);
        this.color = color;
        this.BlockMoulds = {};
    }

    importLib(str) {};
    exportLib() {};
}