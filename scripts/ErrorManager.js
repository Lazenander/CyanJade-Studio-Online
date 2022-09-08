export default class ErrorManager {
    static warn(id, detail = null) {}
    static error(id, detail = null) {
        switch (id) {
            case 1:
                console.log(`Error ${id}: Failed to assign ${detail.name}. It is not a variable.`);
                break;
            case 2:
                console.log(`Error ${id}: Failed to change ${detail.name}. It is not a variable.`);
                break;
            case 3:
                console.log(`Error ${id}: Failed to read ${detail.name}. It is not a variable.`);
                break;
        }
    }
}