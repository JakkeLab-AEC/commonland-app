import { Vector2d } from '@/mainArea/types/vector';
import fs from 'fs';

export async function parsePolylinePoints(filePath: string): Promise<{result: boolean, message?: string, parsedPts?: Vector2d[]}> {    
    try {
        const fileString = await fs.promises.readFile(filePath, 'utf-8');
        const pointLines = fileString.split('\n');
        const parsedPts: {x: number, y: number}[] = [];
        pointLines.forEach(line => {
            const coords = line.split(',');
            const coordX = parseFloat(coords[0]);
            const coordY = parseFloat(coords[1]);

            if(!coordX || !coordY) {
                return {result: false, message: "Parsing float failed due to the invalid numeric string."};
            }

            parsedPts.push({x: coordX, y: coordY});
        });

        return {result: true, parsedPts: parsedPts};
    } catch (error) {
        return {
            result: false,
            message: String(error)
        }
    }
}