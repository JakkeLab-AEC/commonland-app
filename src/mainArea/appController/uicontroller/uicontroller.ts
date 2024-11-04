import { BrowserWindow } from "electron";

export class UIController {
    public static instance: UIController;
    private windowMap: Map<string, BrowserWindow>;

    registerWindow(key: string, window: BrowserWindow) {
        if(!this.windowMap.get(key)) {
            this.windowMap.set(key, window);
        }
    }

    unregisterWindow(key: string) {
        this.windowMap.delete(key);
    }

    getWindow(name: string) {
        return this.windowMap.get(name);
    }

    removeWindow(name: string) {
        this.windowMap.delete(name);
    }

    setWindow(name: string, window: BrowserWindow) {
        this.windowMap.set(name, window);
    }

    private constructor() {
        this.windowMap = new Map();
        UIController.instance = this;
    }

    public static initiate() {
        new UIController();
    }
}