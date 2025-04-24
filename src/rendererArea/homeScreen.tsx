import Sidebar from "./sidebar/sidebar";
import './homeStyle.css'
import Header from "./components/header/header";
import { appInfo } from "../appConfig";
import { ThreeViewPort } from "./components/threeViewport/threeViewport";
import { InspectorWrapper } from "./components/inspector/inspectorWrapper";
import { VisibilityOptions } from "./homescreenitems/visibilityOptions"
import { ModalOverlay } from './homescreenitems/modalOverlay'
import { useEffect } from "react";

export default function HomeScreen() {    
    useEffect(() => {
        const runPython = async () => {
            await window.electronIPCPythonBridge.start();
        }

        runPython();
    }, []);
    
    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'clip' }}>
            <div style={{position: 'absolute', width:'100%', zIndex: 2}}>
                <Header appName={appInfo.ApplicationName} />
            </div>
            <div id="main-sidebar" style={{position:'absolute', justifyContent: 'center', top: 64, bottom: 16, zIndex: 1}}>
                <Sidebar />
            </div>
            <div style={{position:'absolute', justifyContent: 'center', zIndex: 2}}>
                <InspectorWrapper />
            </div>
            <div style={{overflow: 'hidden', position: 'relative'}}>
                <ThreeViewPort />
            </div>
            <div style={{position: 'absolute', right: 16, bottom: 16, zIndex: 2}} id="three-viewport">
                <VisibilityOptions />
            </div>
            <ModalOverlay />
        </div>
    )
}