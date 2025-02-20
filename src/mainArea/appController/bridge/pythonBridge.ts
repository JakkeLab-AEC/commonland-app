import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import path from 'path';
import { dialog } from "electron";
import { UIController } from "../uicontroller/uicontroller";
import { PipeMessageSendRenderer } from "@/dto/pipeMessage";

export class PythonBridge {
    private embeddedPath: string | null;
    private pyProcess: ChildProcessWithoutNullStreams;
    private pythonExecutable: string | null;
    private readonly platform: string
    private readonly appRootPath: string;
    private readonly appRuntimePath: string;
    
    constructor({embeddedPath, platform, appRootPath, appRuntimePath}:{embeddedPath: string, platform: "win"|"mac", appRootPath: string, appRuntimePath: string}) {
        this.embeddedPath = embeddedPath;
        this.platform = platform;
        this.appRootPath = appRootPath;
        this.appRuntimePath = appRuntimePath;
        console.log(`RootPath: ${appRootPath}`);
        console.log(`RuntimePath: ${appRuntimePath}`);
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

    start(scriptPath?: string): void {
        let checkedPath: string;
        if(!scriptPath) {
            checkedPath = path.resolve(this.appRootPath, './mainPython/main.py');
        } else {
            checkedPath = scriptPath;
        }

        try {
            this.pyProcess = spawn(this.pythonExecutable, [checkedPath], {
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

    async send(message: PipeMessageSendRenderer): Promise<any> {        
        const mainWindow = UIController.instance.getWindow('main-window');
        if (!mainWindow) {
            dialog.showMessageBoxSync(mainWindow, {
                title: "System Error",
                message: "Main window is not found.",
                buttons: ["Ok"]
            });
            return;
        }
    
        if(!this.pyProcess) {
            this.start();
        }
        
        console.log(message);

        const convertedMessage:PipeMessageSendRenderer = {
            ...message
        }

        convertedMessage.args.runtimePath = this.appRuntimePath;

        return new Promise((resolve, reject) => {
            console.log('Sending message to Python process...\n');
    
            const data = JSON.stringify(convertedMessage) + '\n';
            // console.log(data);

            const [stdin, stdout] = [this.pyProcess.stdin, this.pyProcess.stdout];
    
            if (!stdin || !stdout) {
                return reject('Python process stdin or stdout is not available.');
            }
    
            stdout.removeAllListeners('data');
    
            const onData = (chunk: Buffer) => {
                console.log(chunk.toString());
                try {
                    const response = JSON.parse(chunk.toString().trim());
                    console.log('Received response from Python:', response);
                    stdout.removeListener('data', onData);

                    this.stop();
                    
                    resolve(response);
                } catch (error) {
                    reject(`Failed to parse response: ${error}`);
                }
            };
    
            stdout.on('data', onData);
    
            stdin.write(data);
            stdin.end();  // 데이터 입력을 완료했음을 알림
        });
    }    
}