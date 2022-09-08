export default class MemoryManager {
    static instance = new MemoryManager();
    constructor() {
        this.inputMemory = {};
        this.outputMemory = {};
    }
    clearInputMemory() {
        this.inputMemory = {};
    }
    clearOutputMemory() {
        this.outputMemory = {};
    }
}