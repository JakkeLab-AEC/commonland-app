import { app, dialog, FileFilter } from "electron";

type OpenFileDialogResult = Promise<{result: boolean, message?: string, filePaths?: string[]}>;

export async function showFileOpenDialog(title: string, defaultPath: string, fileFilters: FileFilter[]): OpenFileDialogResult {
    const {filePaths} = await dialog.showOpenDialog({
        title: title,
        defaultPath: defaultPath,
        filters: fileFilters,
        properties: ['openFile']
    });

    if (!filePaths || filePaths.length == 0) {
        return { result: false, message: 'No file path selected' };
    } else {
        return { result: true, filePaths: filePaths}
    }
}