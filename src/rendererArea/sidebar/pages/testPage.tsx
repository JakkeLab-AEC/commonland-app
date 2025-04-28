import { ButtonPositive } from "../../../rendererArea/components/forms/buttons/buttonPositive"
import { TestAPI } from "../../../rendererArea/api/test/testAPI"
import { useRef } from "react";
import { PipeMessageSendRenderer } from "@/dto/pipeMessage";
import { Vector2d } from "@/mainArea/types/vector";
import { SceneController } from "@/rendererArea/api/three/SceneController";
import * as THREE from 'three'; 
import './test/testStyle.css';

const TEST_POINT_COUNT = 50;

export const TestPage = () => {
    const textBoxRef = useRef<HTMLInputElement>(null);

    const testSendingText = async () => {
        const message: PipeMessageSendRenderer = {
            action: "Test",
            args: {
                message: textBoxRef.current.value,
            }
        }
        await window.electronIPCPythonBridge.send(message);
    }
    
    return (
        <div className="flex flex-col gap-2">
            <div>
                Embedded Python Bridge Test
            </div>
            <div>
                <input className="border w-full" ref={textBoxRef}/>
            </div>
            <ButtonPositive text={"Send Message"} isEnabled={true} onClickHandler={testSendingText} width={'100%'}/>
            <hr/>
        </div>
    )
}
