import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import path from 'path';
import { dialog } from "electron";
import { UIController } from "../uicontroller/uicontroller";

export class PythonBridge {
    private embeddedPath: string | null;
    private pyProcess: ChildProcessWithoutNullStreams;
    private pythonExecutable: string | null;
    private readonly platform: string
    private readonly appRootPath: string;
    
    constructor(embeddedPath: string, platform: "win"|"mac", appRootPath: string) {
        this.embeddedPath = embeddedPath;
        this.platform = platform;
        this.appRootPath = appRootPath;
    }

    ready(): void {
        if (this.pyProcess) {
            console.warn('Python process is already running.');
            return;
        }

        // Embedded python
        let pythonBinary = "";
        if(this.platform == "win") {
            pythonBinary = "python.exe";
        } else {
            pythonBinary = "bin/python"
        }

        const pythonExecutable = path.resolve(this.embeddedPath, pythonBinary);
        this.pythonExecutable = pythonExecutable;

        console.log('Python Executable Path:', pythonExecutable);
    }

    start(scriptPath: string): void {
         try {
            this.pyProcess = spawn(this.pythonExecutable, [scriptPath], {
                stdio: 'pipe'
            });

            this.pyProcess.stderr.on('data', (data) => {
                console.error(`Python stderr: ${data}`);
            });

            this.pyProcess.stdout.on('data', (data) => {
                console.log(data);
            });

            this.pyProcess.on('close', (code) => {
                console.log(`Python process exited with code ${code}`);
                this.pyProcess = null;
            });
        } catch (error) {
            console.error(error);
        }
    }

    test(): void {
        const scriptPath = path.resolve(this.appRootPath, './mainPython/test.py')
        this.start(scriptPath);
    }
    
    stop(): void {
        if (this.pyProcess) {
            this.pyProcess.kill();
            console.log('Python process terminated.');
            this.pyProcess = null;
        } else {
            console.warn('Python process is not running.');
        }
    }

    async send(data: object): Promise<any> {
        const mainWindow = UIController.instance.getWindow('main-window')
        if(!mainWindow) {
            dialog.showErrorBox("Error", "Application is not running.");
        }

        if(!this.pyProcess) {
            dialog.showMessageBox(mainWindow, {
                title: "System Error",
                message: "Python process is not running.",
                buttons: ["Ok"]
            });
            return;
        }

        return new Promise((resolve, reject) => {
            const message = JSON.stringify(data) + '\n';
            const [stdin, stdout] = [this.pyProcess.stdin, this.pyProcess.stdout];

            if(!stdin || !stdout) {
                return reject('Python process stdin or stdout is not available.');
            }
        });
    }
}