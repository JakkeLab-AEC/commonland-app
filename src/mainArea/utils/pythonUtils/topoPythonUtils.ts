import { AppController } from "@/mainArea/appController/appController";
import { OBBDto } from "@/mainArea/models/graphics/obb";
import { PredictedPoint } from "@/mainArea/types/predictedPoint";
import { PointHash, TriangleHash, TriangleSet } from "@/mainArea/types/triangleDataSet";
import { Vector3d } from "@/mainArea/types/vector";
import fs from 'fs';

type PykrigeResult = {result: boolean, topoDataSet?: TriangleSet, message?: string}

export async function runPykrige(obb: OBBDto, resolution: number, basePts: Vector3d[]): Promise<PykrigeResult> {
    const response = await AppController.getInstance().pythonBridge.send({
        action: "CalculateTopo",
        args: {
            obb: {
                pts: obb.pts
            },
            points: basePts,
            resolution: resolution
        }
    });

    if(!response || !response.result) 
        return {result: false, message: "Result not found from python."}

    const jobResult = response.jobResult;
    const pointPath = jobResult.pointFilePath;

    const pointFile = await fs.promises.readFile(pointPath, 'utf-8');
    const pointDatas: PredictedPoint[] = JSON.parse(pointFile);
    
    let indexMaxI = 0;
    let indexMaxJ = 0;
    const pointMap: PointHash[] = [];
    pointDatas.forEach(data => {
        const hash = `${data.i}_${data.j}`;

        indexMaxI = Math.max(indexMaxI, data.i);
        indexMaxJ = Math.max(indexMaxJ, data.j);

        const point: Vector3d = {x: data.x, y: data.y, z: data.z};
        pointMap.push({hash: hash, pt: point})
    });

    const triangles: TriangleHash[] = [];
    for(let i = 0; i < indexMaxI; i++) {
        for(let j = 0; j < indexMaxJ; j++) {
            // Set hashes
            const triangle0 = {
                hashPt0: `${i}_${j}`,
                hashPt1: `${i+1}_${j}`,
                hashPt2: `${i}_${j+1}`,
            }

            const triangle1 = {
                hashPt0: `${i+1}_${j}`,
                hashPt1: `${i}_${j+1}`,
                hashPt2: `${i+1}_${j+1}`,
            }

            triangles.push(triangle0, triangle1);
        }
    }

    const triangleSet: TriangleSet = {
        pts: pointMap,
        triangles: triangles
    }

    return {result: true, topoDataSet: triangleSet};
}