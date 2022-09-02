import Graph from "./Graph.js";

const blockArea = document.getElementById("blockArea");

export default class CodeManager {
    static instance = new CodeManager();
    constructor() {
        this.graph = new Graph();
    }

    render() {
        blockArea.appendChild(this.graph.render())
    }
}