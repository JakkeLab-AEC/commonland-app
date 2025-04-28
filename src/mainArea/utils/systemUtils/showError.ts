import { UIController } from "@/mainArea/appController/uicontroller/uicontroller";
import { dialog } from "electron";

export function showError(title: string, message: string) {
    dialog.showMessageBoxSync(UIController.instance.getWindow('main-window'), {
        type: "error",
        title: title,
        message: message,
        buttons: ["OK"],
    });
}