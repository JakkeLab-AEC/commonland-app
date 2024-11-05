import * as THREE from 'three';
import { DefaultDimensions } from '../defaultConfigs/DefaultDimensionConfigs';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { LayerColorConfig } from '../../../../mainArea/models/uimodels/layerColorConfig';
import { Boring } from '../../../../mainArea/models/serviceModels/boring/boring';
import { colorPaletteValues } from '../../../../public/colorPalette';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import { ModelType } from '@/mainArea/models/modelType';
import { useVisibilityOptionStore } from '@/rendererArea/homescreenitems/visibilityOptionsStore';


export class ThreeBoringPost {
    static async createPostFromModel(boring: Boring, layerColorConfig: LayerColorConfig):Promise<THREE.Object3D|undefined> {

        const layers = boring.getLayers().map(r => { 
            const layerName = r.getName();
            const layerColor = layerColorConfig.getLayerColor(layerName);
            
            return {
            name: r.getName(),
            thickness: r.getThickness(),
            color: layerColor ? parseInt(colorPaletteValues[layerColor].slice(1), 16) : 0x000000
        }})

        const sptValues = boring.getSPTResultSet().getAllResults();

        const threeItems = await ThreeBoringPost.createPost(
            boring.getName(),
            boring.getTopoTop(),
            layers,
            sptValues
        );

        const moveMatrix = new THREE.Matrix4()
        moveMatrix.makeTranslation(boring.getLocationX(), 0, boring.getLocationY());
        
        const threeObjs: THREE.Object3D[] = [];
        const threeGeometryWrapping = [];

        if(!threeItems.sptObjects) return;
        threeItems.sptObjects.forEach(obj => {
            obj.leaderLine.applyMatrix4(moveMatrix);
            obj.textGeometryDepth.applyMatrix4(moveMatrix);
            obj.textGeometrySPTResult.applyMatrix4(moveMatrix);

            // For real object
            const mat = new THREE.MeshBasicMaterial({
                color: 0x000000,
            });

            const textObjectDepth = new THREE.Mesh(obj.textGeometryDepth, mat);
            const textObjectSPTResult = new THREE.Mesh(obj.textGeometrySPTResult, mat);

            threeObjs.push(obj.leaderLine);
            threeObjs.push(textObjectDepth);
            threeObjs.push(textObjectSPTResult);
        });

        threeItems.postSegments.forEach(obj => {
            obj.textGeometry.applyMatrix4(moveMatrix);
            obj.postGeometry.applyMatrix4(moveMatrix);
            obj.leaderLine.applyMatrix4(moveMatrix);

            // For real object
            const realMat = new THREE.MeshPhongMaterial({
                color: obj.color,
                transparent: true,
                opacity: useVisibilityOptionStore.getState().currentPostOpacity/100,
                side: THREE.DoubleSide,
                depthTest: false,

                polygonOffset: true,
                polygonOffsetFactor: 1,
                polygonOffsetUnits: 1
            });
            const segmentMesh = new THREE.Mesh(obj.postGeometry, realMat);
            segmentMesh.userData = {
                type: ModelType.PostSegment,
                layerName: obj.layerName,
            }
            
            const textMat = new THREE.MeshBasicMaterial({
                color: 0x000000,
                side: THREE.DoubleSide,
            })
            const textMesh = new THREE.Mesh(obj.textGeometry, textMat);

            threeObjs.push(textMesh);
            threeObjs.push(segmentMesh);
            threeObjs.push(obj.leaderLine);

            // For wrapping object
            threeGeometryWrapping.push(obj.postGeometry.clone());
        });

        //#region PostName Leader
        if(!threeItems.postNameLeader) return;
        threeItems.postNameLeader.leaderLine.applyMatrix4(moveMatrix);
        threeItems.postNameLeader.textGeometry.applyMatrix4(moveMatrix);
        threeObjs.push(threeItems.postNameLeader.leaderLine);
        
        // For real object
        const postNameObject = new THREE.Mesh(threeItems.postNameLeader.textGeometry, new THREE.MeshBasicMaterial({
            color: 0x000000,
            side: THREE.DoubleSide,
        }));

        threeObjs.push(postNameObject);
        
        //#endregion
        
        //#region BoringEnd Leader
        if(!threeItems.boringEndLeader) return;
        threeItems.boringEndLeader.textGeometry.applyMatrix4(moveMatrix);
        threeItems.boringEndLeader.leaderLine.applyMatrix4(moveMatrix);
        threeObjs.push(threeItems.boringEndLeader.leaderLine);

        // For real object
        const boringEndTextObject = new THREE.Mesh(threeItems.boringEndLeader.textGeometry, new THREE.MeshBasicMaterial({
            color: 0x000000,
            side: THREE.DoubleSide,
        }));

        threeObjs.push(boringEndTextObject);


        // Merge all wrapping objects
        const mergedGeometry = BufferGeometryUtils.mergeGeometries(threeGeometryWrapping, true);
        const wrappingMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,      // Green color
            transparent: true,    // Enable transparency
            opacity: 0.0,         // Set opacity (0 is fully transparent, 1 is fully opaque)
        });

        const parentObject = new THREE.Mesh(mergedGeometry, wrappingMaterial);
        parentObject.add(...threeObjs);

        //#endregion
        console.log(parentObject);
        return parentObject;
    }
    
    static async createPost(boringName: string, topoTop: number, layers:{name: string, thickness:number, color: number}[], sptValues: {depth: number, hitCount: number, distance: number}[]) {
        const dims = DefaultDimensions.getInstance().getDims();
        const radius = dims.shoringPostRadius;
        const offsetText = 0.2;

        // Create post name objects
        const postNameLeader = await this.createLeader(
            boringName,
            0.5, 
            {curved: false, leaderLength: 3}, 
            radius, 
            0.2, 
            topoTop, 
            0x000000, 
            -1
        );

        // Create cylinder segments
        let topoLevel = topoTop;
        const postSegments:{postGeometry: THREE.CylinderGeometry, textGeometry: TextGeometry, leaderLine: THREE.Line, color: number, layerName: string}[] = [];
        for(let i = 0; i < layers.length; i++) {
            const {name, thickness, color} = layers[i];
            if(i == 0) {
                const moveMatrix = new THREE.Matrix4();
                moveMatrix.makeTranslation(0, topoLevel - thickness*0.5, 0);
                const postSegment = await this.createPostSegmenet(
                    name,
                    `EL ${topoLevel.toFixed(2)}`,
                    thickness,
                    radius,
                    false,
                    offsetText,
                    color
                );

                postSegment.leaderLine.applyMatrix4(moveMatrix);
                postSegment.postGeometry.applyMatrix4(moveMatrix);
                postSegment.textGeometry.applyMatrix4(moveMatrix);

                postSegments.push(postSegment);
            } else {
                const moveMatrix = new THREE.Matrix4();
                moveMatrix.makeTranslation(0, topoLevel - thickness*0.5, 0);

                const postSegment = await this.createPostSegmenet(
                    name,
                    `EL ${topoLevel.toFixed(2)}`,
                    thickness,
                    radius,
                    layers[i-1].thickness < 0.6,
                    offsetText,
                    color
                );

                postSegment.leaderLine.applyMatrix4(moveMatrix);
                postSegment.postGeometry.applyMatrix4(moveMatrix);
                postSegment.textGeometry.applyMatrix4(moveMatrix);

                postSegments.push(postSegment);
            }

            topoLevel -= thickness;
        }

        // Create boring end leader
        let sum = 0;
        layers.forEach(layer => sum += layer.thickness);
        const boringEndLedaer = await this.createLeader(
            `시추종료 : ${(topoTop - sum).toFixed(2)}`,
            0.5,
            {curved: true, leaderSegmentLength: [1, 1, 1]},
            radius,
            0.2,
            topoTop - sum,
            0x000000,
            -1
        );

        const sptObjects = await this.createSPTResults(sptValues, topoTop);

        return {
            postNameLeader: postNameLeader,
            postSegments: postSegments,
            boringEndLeader: boringEndLedaer,
            sptObjects: sptObjects
        };
    }

    private static async createPostSegmenet(
        name: string, 
        levelDescription: string, 
        thickness: number, 
        radius: number, 
        curvedLeader: boolean,
        offsetText = 0.1,
        postColor = 0xbfff75
    ):Promise<{postGeometry: THREE.CylinderGeometry, textGeometry: TextGeometry, leaderLine: THREE.Line, color: number, layerName: string}> {
        // Create post
        const geometry = new THREE.CylinderGeometry(radius, radius, thickness, 64);

        geometry.computeBoundingBox();
        
        // Create leader
        let leaderSet: {textGeometry: TextGeometry, leaderLine: THREE.Line}; 
        if(curvedLeader) {
            leaderSet = await this.createLeader(
                `${name} (${levelDescription})`, 
                0.5, 
                {
                curved: curvedLeader,
                leaderSegmentLength: [2, 2, 2],
                }, 
                radius,
                offsetText,
                geometry.boundingBox.max.y
            );
        } else {
            leaderSet = await this.createLeader(
                `${name} (${levelDescription})`,
                0.5,
                {
                    curved: curvedLeader,
                    leaderLength: 4,
                },
                radius,
                offsetText,
                geometry.boundingBox.max.y
            );
        }

        return {postGeometry: geometry, textGeometry: leaderSet.textGeometry, leaderLine: leaderSet.leaderLine, color: postColor, layerName: name}
    }

    private static async createLeader(
        text: string,
        fontSize = 0.5,
        leaderOption: { curved: boolean, leaderLength?: number, leaderSegmentLength?: number[]}, 
        offset: number,
        offsetText: number,
        coordY: number,
        leaderColor = 0x000000,
        directionFactor = 1
    ): Promise<{ leaderLine: THREE.Line, textGeometry: TextGeometry }|undefined> {
        if(!leaderOption) return;
        const { curved, leaderLength, leaderSegmentLength } = leaderOption;

        // 검증: curved가 true일 경우, leaderSegmentLength가 정의되어 있어야 하고 길이가 3이어야 함
        if (curved && (!leaderSegmentLength || leaderSegmentLength.length !== 3)) {
            console.error('Invalid leaderSegmentLength for curved leader.');
            return;
        }

        // 검증: curved가 false일 경우, leaderLength가 정의되어 있어야 함
        if (!curved && !leaderLength) {
            console.error('leaderLength must be provided when leader is not curved.');
            return;
        }
        
        const trueCases = 
            (curved && leaderSegmentLength && leaderSegmentLength.length == 3) ||
            (!curved && leaderLength);

        if (!trueCases) {
            if (!curved) {
                throw new Error('When leader is not curved, leaderLength should be given.');
            } else {
                throw new Error('When leader is curved, leaderSegmentLength should contain 3 numbers.');
            }
        }

        const material = new THREE.LineBasicMaterial({
            color: leaderColor
        });

        // Leader lines
        let line: THREE.Line;
        if (curved && leaderSegmentLength) {
            const pt1 = new THREE.Vector3(directionFactor*offset, coordY, 0);
            const pt2 = new THREE.Vector3(directionFactor*(offset + leaderSegmentLength[0]), coordY, 0);
            const pt3 = new THREE.Vector3(directionFactor*(offset + leaderSegmentLength[0]), coordY - leaderSegmentLength[1], 0);
            const pt4 = new THREE.Vector3(directionFactor*(offset + leaderSegmentLength[0] + leaderSegmentLength[2]), coordY - leaderSegmentLength[1], 0);
            const segmentPts = [pt1, pt2, pt3, pt4];
            const geometry = new THREE.BufferGeometry().setFromPoints(segmentPts);
            line = new THREE.Line(geometry, material);
        } else if(leaderLength) {
            const pt1 = new THREE.Vector3(directionFactor*offset, coordY, 0);
            const pt2 = new THREE.Vector3(directionFactor*(offset + leaderLength), coordY, 0);
            const segmentPts = [pt1, pt2];
            const geometry = new THREE.BufferGeometry().setFromPoints(segmentPts);
            line = new THREE.Line(geometry, material);
        } else {
            return;
        }

        // Load font and create text geometry
        const textGeometry = await this.createTextGeometry(text, fontSize);

        if(!textGeometry)
            return;
        if(!textGeometry.boundingBox)
            return;

        const horLength = Math.abs(textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);
        const verLength = Math.abs(textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y);
        
        const matrixCoord: {x: number, y: number, z: number} = {
            x: directionFactor == 1 ? directionFactor * (offset + (curved ? leaderSegmentLength[0] + leaderSegmentLength[2] : leaderLength) + offsetText) :
                                      directionFactor * (offset + (curved ? leaderSegmentLength[0] + leaderSegmentLength[2] : leaderLength) + offsetText + horLength),
            y: coordY - (curved ? leaderSegmentLength[1] : 0) - verLength*0.5,
            z: 0,
        };
        const textTranslationMatrix = new THREE.Matrix4();
        textTranslationMatrix.makeTranslation(
            matrixCoord.x,
            matrixCoord.y,
            matrixCoord.z
        );
        textGeometry.applyMatrix4(textTranslationMatrix);
        
        return {
            leaderLine: line,
            textGeometry: textGeometry
        }
    }

    static async createSPTResults(sptValues: {depth: number, hitCount: number, distance: number}[], topLevel: number, directionFactor = -1, offsetText = 0.1, leaderLength = 2, textColor = 0x000000) {
        const threeObjects:{ textGeometrySPTResult: TextGeometry, textGeometryDepth:TextGeometry, leaderLine: THREE.Line }[] = [];
        for(const spt of sptValues) {
            // Create leader objects
            const leaderObjects = await this.createLeader(
                `${spt.hitCount} / ${spt.distance}`,
                0.3,
                {curved: false, leaderLength: leaderLength},
                1,
                offsetText,
                topLevel - spt.depth,
                0x000000,
                directionFactor
            );

            const hitCountTextLength = Math.abs(leaderObjects.textGeometry.boundingBox.max.x - leaderObjects.textGeometry.boundingBox.min.x);
            

            // Create depth geomtery
            const textGeometry = await this.createTextGeometry(spt.depth.toFixed(1).toString(), 0.3);
            if(!textGeometry || !textGeometry.boundingBox) return;

            const horLength = Math.abs(textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);
            const verLength = Math.abs(textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y);

            const matrix = new THREE.Matrix4();
            matrix.makeTranslation(
                directionFactor == 1 ? directionFactor*(leaderLength + offsetText) : directionFactor*(leaderLength + offsetText + horLength + hitCountTextLength + 1),
                topLevel - spt.depth - verLength*0.5,
                0
            );
            textGeometry.applyMatrix4(matrix);

            threeObjects.push({
                textGeometrySPTResult: leaderObjects.textGeometry,
                textGeometryDepth: textGeometry,
                leaderLine: leaderObjects.leaderLine
            });
        }

        return threeObjects;
    }

    private static async createTextGeometry(
        text: string,
        fontSize: number,
        textColor = 0x000000
    ): Promise<TextGeometry|undefined> {
        return new Promise((resolve, reject) => {
            // Load font and create text geometry
            const fontLoader = new FontLoader();
            fontLoader.load('./src/fontjson/font_default.json', (font) => {
                const textGeometry = new TextGeometry(text, {
                    font: font,
                    size: fontSize,
                    height: 0.0,
                    curveSegments: 12,
                    bevelEnabled: false,
                });
    
                // Compute the bounding box of the text
                textGeometry.computeBoundingBox();
    
                // Resolve the promise with the created objects
                resolve(textGeometry);
            }, undefined, (error) => {
                reject(error);  // Reject the promise if font loading fails
            });
        })
    }
}