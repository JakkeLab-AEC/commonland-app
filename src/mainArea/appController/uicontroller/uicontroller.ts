import { BrowserWindow } from "electron";

export class UIController {
    private windowController: Map<string, BrowserWindow>;

    registerWindow(key: string, window: BrowserWindow) {
        if(!this.windowController.get(key)) {
            this.windowController.set(key, window);
        }
    }

    unregisterWindow(key: string) {
        this.windowController.delete(key);
    }

    constructor() {
        this.windowController = new Map();
    }
}