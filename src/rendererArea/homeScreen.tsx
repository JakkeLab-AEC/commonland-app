import React, { useEffect, useState } from "react"

export const HomeScreen = () => {
    const [receivedMessage, setMessage] = useState<string>('');
    const ipcTest = async () => {
        const message = await window.electronIPCElectronTest.sendMessage();
        if(message) {
            setMessage(message);
        }
    }

    return (
        <div className="p-2 flex flex-col gap-2">
            <div>
                Hello, this is jakke's electron boilerplate.
            </div>
            <hr/>
            <div>
                <button className="border" onClick={ipcTest}>IPC Test</button>
            </div>
            <div>
                If ipc handler works well, the message will appear below.
            </div>
            <hr/>
            <div>
                {receivedMessage}
            </div>
        </div>
    )
}
