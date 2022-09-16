importScripts("./Graph.js");
importScripts("./codeManager.js");

self.onmessage = (data) => {
    console.log(CodeManager.instance);
}