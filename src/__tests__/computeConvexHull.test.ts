import { getConvexHull } from "../mainArea/utils/convexHullUtils";
import { Vector3d } from "../mainArea/types/vector";
import { exec } from "child_process";
import path from "path";
import fs from 'fs';
import WS from 'ws';
import { computeOBB } from "../mainArea/utils/obbUtils";

const TESTER_PORT = 3355;
const TESTER_ADDRESS = 'ws://localhost';

type Line = {p1: {x: number, y: number, z: number}, p2: {x: number, y: number, z: number}}

function connectToTester(port: number) {
    return new WS.WebSocket(`${TESTER_ADDRESS}:${port}`);
}

function convertPointData(pts: {x: number, y: number, z: number}[], color = 0x000000) {
    return {
        geometry: "point",
        args: pts,
        color: color
    }
}

function convertLineData(lines: {p1: {x: number, y: number, z: number}, p2: {x: number, y: number, z: number}}[], color = 0x000000) {
    return {
        geometry: "line",
        args: lines,
        color: color
    }
}

function generateRandomPoints(length: number, digits: number):Vector3d[] {
    const pts:Vector3d[] = [];

    for(let i = 0; i < length; i++) {
        const x = (Math.random() * 2 - 1) * Math.pow(10, digits);
        const y = (Math.random() * 4 - 1) * Math.pow(20, digits);
        const z = (Math.random() * 2 - 1) * Math.pow(10, digits);

        pts.push({x, y, z});
    }

    return pts;
}

const TEST_PTS: Vector3d[] = [
    {x: -2, y: 0, z: 0},
    {x: 0, y: 2, z: 0},
    {x: 2, y:0, z: 0},
    {x: 0, y: -2, z: 0},
]

describe('Get OBB Test', () => {
    test('Create OBB with 20 pts', async () => {
        const points: Vector3d[] = generateRandomPoints(20, 2);
        // const points: Vector3d[] = TEST_PTS;

        const pt3d = points.map(h => {
            return {
                x: h.x,
                y: h.y,
                z: 0
            }
        });

        const hull = getConvexHull(points);
        const hullPts = hull.map(h => {
            return {
                x: h.x,
                y: h.y,
                z: 0
            }
        });
        
        const hullLines: Line[] = [];
        for(let i = 0; i< hullPts.length; i++) {
            if(i === hullPts.length - 1) {
                hullLines.push({
                    p1: {x: hullPts[i].x, y: hullPts[i].y, z: 0},
                    p2: {x: hullPts[0].x, y: hullPts[0].y, z: 0}
                });
            } else {
                hullLines.push({
                    p1: {x: hullPts[i].x, y: hullPts[i].y, z: 0},
                    p2: {x: hullPts[i+1].x, y: hullPts[i+1].y, z: 0}
                });
            }
        }
        
        const obb = computeOBB(hullPts);
        const obbPts = [
            {x: obb.p0.x ,y: obb.p0.y, z: 0},
            {x: obb.p1.x ,y: obb.p1.y, z: 0},
            {x: obb.p2.x ,y: obb.p2.y, z: 0},
            {x: obb.p3.x ,y: obb.p3.y, z: 0},
        ]

        const obbLines:Line[] = [
            {p1: {x: obb.p0.x ,y: obb.p0.y, z: 0}, p2: {x: obb.p1.x ,y: obb.p1.y, z: 0}},
            {p1: {x: obb.p1.x ,y: obb.p1.y, z: 0}, p2: {x: obb.p2.x ,y: obb.p2.y, z: 0}},
            {p1: {x: obb.p2.x ,y: obb.p2.y, z: 0}, p2: {x: obb.p3.x ,y: obb.p3.y, z: 0}},
            {p1: {x: obb.p3.x ,y: obb.p3.y, z: 0}, p2: {x: obb.p0.x ,y: obb.p0.y, z: 0}},
        ]

        const ptMessage = convertPointData(pt3d);
        const liMessage = convertLineData(hullLines);
        const obbPtMessage = convertPointData(obbPts, 0x00ff44)
        const obbLiMessage = convertLineData(obbLines, 0xff0000)

        const client = connectToTester(TESTER_PORT);
        client.on("open", () => {
            client.send(JSON.stringify(ptMessage));
            client.send(JSON.stringify(liMessage));
            client.send(JSON.stringify(obbPtMessage));
            client.send(JSON.stringify(obbLiMessage));
        });

    });
});