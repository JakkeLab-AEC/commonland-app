import { ThreeExporter } from "../../../rendererArea/api/three/exporters/threeExporter"
import { SceneController } from "../../../rendererArea/api/three/SceneController"
import { ThreeBoringPost } from "../../../rendererArea/api/three/predefinedCreations/boringPost"
import { ButtonPositive } from "../../../rendererArea/components/buttons/buttonPositive"
import React from "react"
import * as THREE from 'three';
import { DXFWriter, Layer, Text, Line, Block, BlockInsert } from "../../../rendererArea/api/dxfwriter/dxfwriter"
import { ColorIndexPalette } from "../../../rendererArea/components/palette/colorIndexPalette"
import { TestAPI } from "../../../rendererArea/api/test/testAPI"

export const TestPage = () => {
    const testAddPost = async () => {
        const layers:{name: string, thickness:number, color: number}[] = [
            {name: '레이어1', thickness: 5, color: 0x4287f5},
            {name: '레이어2', thickness: 0.5, color: 0x84fab9},
            {name: '레이어3', thickness: 2, color: 0xffab4a},
        ];

        const sptValues:{depth: number, hitCount: number, distance: number;}[] = [
            {depth: 1, hitCount: 5, distance: 30},
            {depth: 2, hitCount: 3, distance: 30},
            {depth: 3, hitCount: 5, distance: 25},
            {depth: 4, hitCount: 4, distance: 40},
        ];

        const topoTop = 24;
        const postSet = await ThreeBoringPost.createPost('BH-01', topoTop, layers, sptValues);

        const threeObjs: THREE.Object3D[] = []
        postSet.postSegments.forEach(set => {
            threeObjs.push(set.leaderLine);
            threeObjs.push(set.postMesh);
            threeObjs.push(set.textMesh);
        });

        postSet.sptObjects.forEach(set => {
            threeObjs.push(set.textSPTResultObject);
            threeObjs.push(set.textDepthObject);
            threeObjs.push(set.leaderLine);
        });

        threeObjs.push(postSet.postNameLeader.leaderLine);
        threeObjs.push(postSet.postNameLeader.textMesh);

        threeObjs.push(postSet.boringEndLeader.leaderLine);
        threeObjs.push(postSet.boringEndLeader.textMesh);

        SceneController.getInstance().addObjects(threeObjs);
    }

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
    
    return (
        <div>
            {/* <ButtonPositive text={"Test Post"} isEnabled={true} onClickHandler={testAddPost}/>
            <ButtonPositive text={"Download Scene OBJ"} isEnabled={true} onClickHandler={testDownloadScene}/>
            <ButtonPositive text={"Test DXF Export Empty"} isEnabled={true} onClickHandler={testDXFWriter}/>
            <ButtonPositive text={"Test DXF Export Text"} isEnabled={true} onClickHandler={testDXFWriterWithEntity}/> */}
            <ButtonPositive text={"Create Test Borings"} isEnabled={true} onClickHandler={testPosts}/>
            <ColorIndexPalette width={'full'} height={120} onClickHandler={testOnSelectColor} headerName="Colors" />
        </div>
    )
}
