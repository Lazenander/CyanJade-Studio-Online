export default class ErrorManager {
    static warn(id, detail = null) {}
    static error(id, detail = null) {
        switch (id) {
            case 1:
                console.error(`Error ${id}: Failed to assign ${detail.name}. It is not a variable.`);
                break;
            case 2:
                console.error(`Error ${id}: Failed to change ${detail.name}. It is not a variable.`);
                break;
            case 3:
                console.error(`Error ${id}: Failed to read ${detail.name}. It is not a variable.`);
                break;
            case 4:
                console.error(`Error ${id}: Address ${detail.name} do not exist.`);
                break;
            default:
                console.error(`Unknown error.`);
                break;
        }
    }
}