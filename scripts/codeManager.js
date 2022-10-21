import Graph from "./Graph.js";

export default class CodeManager {
    static instance = new CodeManager("mainFlow");

    constructor(type = "mould") {
        this.type = type;
        this.inputVariableNames = [];
        this.outputVariableNames = [];
        this.outputPort = 0;
        this.graph = new Graph();
        this.blockCoords = {};
    }

    addBlock(blockMould, x, y) {
        let ret = this.graph.addBlock(blockMould, x, y);
        this.blockCoords[ret] = ({
            x1: x,
            x2: x + blockMould.size.width + 1,
            y1: y,
            y2: y + blockMould.size.height + 1
        });
        return ret;
    }

    delBlock(index) {
        delete this.blockCoords[index];
        this.graph.delBlock(index);
    }

    _coorAvailable(x1, y1, x2, y2, ignoreIndex = -1) {
        for (let block in this.blockCoords) {
            if (block == ignoreIndex)
                continue;
            if (!(x2 < this.blockCoords[block].x1 ||
                    y2 < this.blockCoords[block].y1 ||
                    x1 > this.blockCoords[block].x2 ||
                    y1 > this.blockCoords[block].y2))
                return false;
        }
        return true;
    }

    calCoor(OrigX1, OrigY1, chosedBlockMould, canvasSize, ignoreIndex = -1) {
        if (OrigX1 < 0)
            OrigX1 = 0;
        if (OrigX1 + chosedBlockMould.size.width + 2 > canvasSize.width)
            OrigX1 = canvasSize.width - chosedBlockMould.size.width - 2;
        if (OrigY1 < 0)
            OrigY1 = 0;
        if (OrigY1 + chosedBlockMould.size.height + 2 > canvasSize.height)
            OrigY1 = canvasSize.height - chosedBlockMould.size.height - 2;

        let q = [{ x1: OrigX1, y1: OrigY1, x2: OrigX1 + chosedBlockMould.size.width + 1, y2: OrigY1 + chosedBlockMould.size.height + 1 }];

        function point2str(point) {
            return point.x1 + "_" + point.y1 + "_" + point.x2 + "_" + point.y2;
        }

        let visited = {};
        let calX = -1,
            calY = -1;

        while (q.length != 0) {
            let point = q.shift();
            if (visited[point2str(point)])
                continue;
            visited[point2str(point)] = true;

            if (this._coorAvailable(point.x1, point.y1, point.x2, point.y2, ignoreIndex)) {
                calX = point.x1;
                calY = point.y1;
                break;
            }

            if (point.x1 - 1 >= 0)
                q.push({
                    x1: point.x1 - 1,
                    y1: point.y1,
                    x2: point.x2 - 1,
                    y2: point.y2
                });
            if (point.x2 + 1 < canvasSize.width)
                q.push({
                    x1: point.x1 + 1,
                    y1: point.y1,
                    x2: point.x2 + 1,
                    y2: point.y2
                });
            if (point.y1 - 1 >= 0)
                q.push({
                    x1: point.x1,
                    y1: point.y1 - 1,
                    x2: point.x2,
                    y2: point.y2 - 1
                });
            if (point.y1 + 1 < canvasSize.height)
                q.push({
                    x1: point.x1,
                    y1: point.y1 + 1,
                    x2: point.x2,
                    y2: point.y2 + 1
                });
        }

        return { x: calX, y: calY }
    }

    isConnectionAvailable(index1, index2, dataImport, dataExport, type) {
        return this.graph.isConnectionAvailable(index1, index2, dataImport, dataExport, type);
    }
}