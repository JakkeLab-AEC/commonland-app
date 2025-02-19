import { ButtonPositive } from "../../../rendererArea/components/buttons/buttonPositive"
import { ColorIndexPalette } from "../../../rendererArea/components/palette/colorIndexPalette"
import { TestAPI } from "../../../rendererArea/api/test/testAPI"
import {MultilineTextbox} from '../../components/multilineTextbox/multilineTextBox';
import { ThreeExporter } from "@/rendererArea/api/three/exporters/threeExporter";
import { ModalLoadingProject } from "@/rendererArea/components/header/header";
import { useRef } from "react";
import { PipeMessageSend, PipeMessageSendRenderer } from "@/dto/pipeMessage";
import { getConvexHull } from "@/mainArea/utils/convexHullUtils";
import { Vector2d, Vector3d } from "@/mainArea/types/vector";
import { createConvexHullGeometry, createTextOverlay } from "@/rendererArea/api/three/utils/createConvexHull";
import { SceneController } from "@/rendererArea/api/three/SceneController";
import * as THREE from 'three'; 
import './test/testStyle.css';
import { computeOBB } from "@/mainArea/utils/obbUtils";
import { createOBBShape } from "@/rendererArea/api/three/utils/createOBBShape";

const TEST_POINT_COUNT = 50;

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
        const message: PipeMessageSendRenderer = {
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

    const testConvexHull = () => {
        const points: Vector2d[] = [];
        for(let i = 0; i < TEST_POINT_COUNT; i++) {
            points.push({
                x: Math.random()*100 - 50,
                y: Math.random()*100 - 50,
            });
        }

        const {originalPts, hullPts, lines, hullPtValues} = createConvexHullGeometry(points);
        SceneController.getInstance().addObjects([originalPts, lines, hullPts]);

        hullPtValues.forEach((pt, index) => {
            createTextOverlay(
                SceneController.getInstance().getRenderer(), 
                SceneController.getInstance().getCamera(),
                new THREE.Vector3(pt.x, pt.y, 0),
                index.toString(),
            );
        });
    }

    const testOBB = () => {
        const points: Vector2d[] = [];
        for(let i = 0; i < TEST_POINT_COUNT; i++) {
            points.push({
                x: Math.random()*100 - 50,
                y: Math.random()*100 - 50,
            });
        }

        const {originalPts, hullPts, lines, hullPtValues} = createConvexHullGeometry(points);
        SceneController.getInstance().addObjects([originalPts, lines, hullPts]);

        hullPtValues.forEach((pt, index) => {
            createTextOverlay(
                SceneController.getInstance().getRenderer(), 
                SceneController.getInstance().getCamera(),
                new THREE.Vector3(pt.x, pt.y, 0),
                index.toString(),
            );
        });
        
        const obb = computeOBB(points);
        if(!obb) return;
        
        console.log(obb);

        const obbObjects = createOBBShape(obb);
        SceneController.getInstance().addObjects(obbObjects);
    }

    
    return (
        <div className="flex flex-col gap-2">
            {/* <ButtonPositive text={"Create Test Borings"} isEnabled={true} onClickHandler={testPosts}/> */}
            {/* <ModalLoadingProject /> */}
            {/* <ButtonPositive text={"Test Python"} isEnabled={true} onClickHandler={testPython} />  */}
            {/* <hr/> */}
            <div>
                Embedded Python Bridge Test
            </div>
            <div>
                <input className="border w-full" ref={textBoxRef}/>
            </div>
            <ButtonPositive text={"Send Message"} isEnabled={true} onClickHandler={testSendingText} width={'100%'}/>
            <hr/>
            <label>Graphics Test</label>
            <ButtonPositive text={"Test ConvexHull"} isEnabled={true} onClickHandler={testConvexHull} width={'100%'}/>
            <ButtonPositive text={"Test OBB"} isEnabled={true} onClickHandler={testOBB} width={'100%'}/>
        </div>
    )
}
