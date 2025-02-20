import { getConvexHull } from "../mainArea/utils/convexHullUtils";
import { Vector3d } from "../mainArea/types/vector";
import { exec } from "child_process";
import path from "path";
import fs from 'fs';

describe('Convex Hull Algorithm - Gift Wrapping (Jarvis March)', () => {
    // test('Convex Hull should correctly compute for 20 points', async () => {
    //     const points: Vector3d[] = [
    //         { x: -2.51, y: 9.01, z: 4.64 },
    //         { x: 1.97, y: -6.88, z: -6.88 },
    //         { x: -8.84, y: 7.32, z: 2.02 },
    //         { x: 4.16, y: -9.59, z: 9.4 },
    //         { x: 6.65, y: -5.75, z: -6.36 },
    //         { x: -6.33, y: -3.92, z: 0.5 },
    //         { x: -1.36, y: -4.18, z: 2.24 },
    //         { x: -7.21, y: -4.16, z: -2.67 },
    //         { x: -0.88, y: 5.7, z: -6.01 },
    //         { x: 0.28, y: 1.85, z: -9.07 },
    //         { x: 2.15, y: -6.59, z: -8.7 },
    //         { x: 8.98, y: 9.31, z: 6.17 },
    //         { x: -3.91, y: -8.05, z: 3.68 },
    //         { x: -1.2, y: -7.56, z: -0.1 },
    //         { x: -9.31, y: 8.19, z: -4.82 },
    //         { x: 3.25, y: -3.77, z: 0.4 },
    //         { x: 0.93, y: -6.3, z: 9.39 },
    //         { x: 5.5, y: 8.79, z: 7.9 },
    //         { x: 1.96, y: 8.44, z: -8.23 },
    //         { x: -6.08, y: -9.1, z: -3.49 },
    //         { x: -2.23, y: -4.57, z: 6.57 },
    //         { x: -2.86, y: -4.38, z: 0.85 },
    //         { x: -7.18, y: 6.04, z: -8.51 },
    //         { x: 9.74, y: 5.44, z: -6.03 },
    //         { x: -9.89, y: 6.31, z: 4.14 },
    //         { x: 4.58, y: 5.43, z: -8.52 },
    //         { x: -2.83, y: -7.68, z: 7.26 },
    //         { x: 2.47, y: -3.38, z: -8.73 },
    //         { x: -3.78, y: -3.5, z: 4.59 },
    //         { x: 2.75, y: 7.74, z: -0.56 }
    //     ];

    //     // ✅ Convex Hull 계산
    //     const hull = getConvexHull(points);

    //     // ✅ JSON 데이터 저장 (API에서 제공)
    //     const testData = { points, hull };
    //     const filePath = path.resolve(__dirname, "testData.json");
    //     fs.writeFileSync(filePath, JSON.stringify(testData, null, 2));

    //     // ✅ 웹 브라우저에서 시각화 페이지 열기
    //     // exec(`start http://localhost:3000/visualizer.html`);

    //     console.log("✅ Convex Hull 시각적 테스트 실행됨! 브라우저에서 결과를 확인하세요.");
    // });
});