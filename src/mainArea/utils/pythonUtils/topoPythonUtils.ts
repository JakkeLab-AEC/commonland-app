import { AppController } from "@/mainArea/appController/appController";
import { OBBDto } from "@/mainArea/models/graphics/obb";
import { KrigingResult } from "@/mainArea/types/predictedPoint";
import { TriangleSet, TriangleIndicies } from "@/mainArea/types/triangleDataSet";
import { Vector3d } from "@/mainArea/types/vector";
import fs from 'fs';
import { VectorUtils } from "jakke-graphics-ts/dist";

type PykrigeResult = {result: boolean, topoDataSet?: TriangleSet, message?: string}

export async function runPykrige(obb: OBBDto, resolution: number, basePts: Vector3d[]): Promise<PykrigeResult> {
    // Convert basePts to fit direction with obb
    const convertedPts = basePts.map(p => {
        const translated = VectorUtils.subtract(p, {...obb.anchor, z: 0});
        const rotated = VectorUtils.rotateOnXY(translated, -obb.rotationX);
        return rotated;
    });

    const response = await AppController.getInstance().pythonBridge.send({
        action: "CalculateTopo",
        args: {
            obb: obb,
            points: convertedPts,
            resolution: resolution
        }
    });

    if(!response || !response.result) 
        return {result: false, message: "Result not found from python."}

    const jobResult = response.jobResult;
    const pointPath = jobResult.pointFilePath;

    const pointFile = await fs.promises.readFile(pointPath, 'utf-8');
    const kriggingResult: KrigingResult = JSON.parse(pointFile);
    const maxI = kriggingResult.max_i;
    const maxJ = kriggingResult.max_j;

    const triangles: TriangleIndicies[] = [];
    for(let i = 0; i < maxI; i++) {
        for(let j = 0; j < maxJ; j++) {
            // Set hashes
            const triangle0: TriangleIndicies = {
                p0: { i: i, j: j },
                p1: { i: i+1, j: j },
                p2: { i: i, j: j+1 }
            };

            const triangle1: TriangleIndicies = {
                p0: { i: i+1, j: j },
                p1: { i: i, j: j+1 },
                p2: { i: i+1, j: j+1 }
            };

            triangles.push(triangle0, triangle1);
        }
    }

    const triangleSet: TriangleSet = {
        pts: kriggingResult.points,
        anchor: { ...obb.anchor },
        rotation: obb.rotationX,
        resolution: kriggingResult.resolution,
        maxI: maxI,
        maxJ: maxJ
    }

    return {result: true, topoDataSet: triangleSet};
}