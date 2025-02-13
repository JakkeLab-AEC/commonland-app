import { ButtonPositive } from "../../../rendererArea/components/buttons/buttonPositive"
import { ColorIndexPalette } from "../../../rendererArea/components/palette/colorIndexPalette"
import { TestAPI } from "../../../rendererArea/api/test/testAPI"
import {MultilineTextbox} from '../../components/multilineTextbox/multilineTextBox';
import { ThreeExporter } from "@/rendererArea/api/three/exporters/threeExporter";
import { ModalLoadingProject } from "@/rendererArea/components/header/header";
import { useRef } from "react";
import { PipeMessageSend } from "@/dto/pipeMessage";

export const TestPage = () => {
    const textBoxRef = useRef<HTMLInputElement>(null);

    const testPosts = async () => {
        const testApi = new TestAPI();
        testApi.createTestBorings(1);
    }

    const testOnSelectColor = (index: number) => {
        console.log(index);
        const teststring = 'hello';
    }

    const testSendingText = async () => {
        const message: PipeMessageSend = {
            action: "Test",
            args: {
                message: textBoxRef.current.value,
            }
        }
        await window.electronIPCPythonBridge.start();
        await window.electronIPCPythonBridge.send(message);
    }

    const testPython = async () => {
        await window.electronIPCPythonBridge.test();
    }

    
    return (
        <div className="flex flex-col gap-2">
            <ButtonPositive text={"Create Test Borings"} isEnabled={true} onClickHandler={testPosts}/>
            <ModalLoadingProject />
            <ButtonPositive text={"Test Python"} isEnabled={true} onClickHandler={testPython} /> 
            <hr/>
            <div>
                Send Message Test
            </div>
            <div>
                <input className="border w-full" ref={textBoxRef}/>
            </div>
            <ButtonPositive text={"Send Message"} isEnabled={true} onClickHandler={testSendingText} width={'100%'}/>
        </div>
    )
}
