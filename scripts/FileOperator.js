export default class FileOperator {
    static filename;

    static openFile() {
        let input = document.createElement('input');
        input.style.width = "0";
        input.style.height = "0";
        input.style.opacity = "0";
        input.style.display = "none";
        input.setAttribute("accept", ".cjade");
        input.type = 'file';
        return input;
    }

    static saveFile(filename, text) {
        let output = document.createElement('a');
        output.style.width = "0";
        output.style.height = "0";
        output.style.opacity = "0";
        output.style.display = "none";
        output.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        output.setAttribute('download', filename);
        document.body.appendChild(output);
        output.onchange = () => {
            document.body.removeChild(output);
        };
        output.click();
    }
}