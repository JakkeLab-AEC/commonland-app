import { ThreeExporter } from "../../../rendererArea/api/three/exporters/threeExporter"
import { SceneController } from "../../../rendererArea/api/three/SceneController"
import { ThreeBoringPost } from "../../../rendererArea/api/three/predefinedCreations/boringPost"
import { ButtonPositive } from "../../../rendererArea/components/buttons/buttonPositive"
import React from "react"
import * as THREE from 'three';
import { DXFWriter, DXFLayer, Text, Line, Block, BlockInsert } from "../../../rendererArea/api/dxfwriter/dxfwriter"
import { ColorIndexPalette } from "../../../rendererArea/components/palette/colorIndexPalette"
import { TestAPI } from "../../../rendererArea/api/test/testAPI"
import {MultilineTextbox} from '../../components/multilineTextbox/multilineTextBox';

export const TestPage = () => {

    const testPosts = async () => {
        const testApi = new TestAPI();
        testApi.createTestBorings();
    }
    

    const testDownloadScene = async () => {
        ThreeExporter.exportAsObjAndMtl();
    }

    const testDXFWriter = () => {
        DXFWriter.testNoEntityWithLayers();
    }

    const testDXFWriterWithEntity = () => {
        DXFWriter.testTextEntityWithLayers();
    }

    const testDXFWriterWithStyle = () => {

    }

    const testOnSelectColor = (index: number) => {
        console.log(index);
    }

    const onChangeListener = (textLines: string[]) => {
        console.log(textLines);
    }
    
    return (
        <div>
            {/* <ButtonPositive text={"Test Post"} isEnabled={true} onClickHandler={testAddPost}/>
            <ButtonPositive text={"Download Scene OBJ"} isEnabled={true} onClickHandler={testDownloadScene}/>
            <ButtonPositive text={"Test DXF Export Empty"} isEnabled={true} onClickHandler={testDXFWriter}/>
            <ButtonPositive text={"Test DXF Export Text"} isEnabled={true} onClickHandler={testDXFWriterWithEntity}/> */}
            <ButtonPositive text={"Create Test Borings"} isEnabled={true} onClickHandler={testPosts}/>
            <ColorIndexPalette width={'full'} height={120} onClickHandler={testOnSelectColor} headerName="Colors" />
            <MultilineTextbox height={240} width={160} maxCharsPerLine={8} />
        </div>
    )
}
