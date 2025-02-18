import { computeConvexHull, getCCW, angleBetweenVectors, findNextPoint } from "../mainArea/utils/convexHullUtils";
import { Vector2d, Vector3d } from "../mainArea/types/vector";

debugger;

describe('Convex Hull Algorithm - Gift Wrapping (Jarvis March)', () => {
    test('getCCW should return positive for counterclockwise rotation', () => {
        const p0: Vector2d = { x: 0, y: 0 };
        const p1: Vector2d = { x: 1, y: 0 };
        const p2: Vector2d = { x: 0, y: 1 };

        expect(getCCW(p0, p1, p2)).toBeGreaterThan(0);
    });

    test('getCCW should return negative for clockwise rotation', () => {
        const p0: Vector2d = { x: 0, y: 0 };
        const p1: Vector2d = { x: 0, y: 1 };
        const p2: Vector2d = { x: 1, y: 0 };

        expect(getCCW(p0, p1, p2)).toBeLessThan(0);
    });

    test('angleBetweenVectors should correctly compute the angle', () => {
        const p0: Vector2d = { x: 0, y: 0 };
        const p1: Vector2d = { x: 1, y: 0 };
        const p2: Vector2d = { x: 1, y: 1 };

        expect(angleBetweenVectors(p0, p1, p2)).toBeCloseTo(Math.PI / 2, 5); // 90 degrees
    });

    test('Convex Hull should correctly compute for 20 points', () => {
        const points: Vector3d[] = [
            { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 2, y: 2, z: 0 }, { x: 3, y: 3, z: 0 },
            { x: 4, y: 4, z: 0 }, { x: 5, y: 5, z: 0 }, { x: 6, y: 1, z: 0 }, { x: 7, y: 2, z: 0 },
            { x: 8, y: 3, z: 0 }, { x: 9, y: 4, z: 0 }, { x: 10, y: 5, z: 0 }, { x: 5, y: 6, z: 0 },
            { x: 4, y: 2, z: 0 }, { x: 3, y: 1, z: 0 }, { x: 6, y: 6, z: 0 }, { x: 7, y: 7, z: 0 },
            { x: 8, y: 8, z: 0 }, { x: 9, y: 9, z: 0 }, { x: 0, y: 9, z: 0 }, { x: 10, y: 0, z: 0 }
        ];

        const expectedHull = [
            { x: 0, y: 0, z: 0 }, { x: 10, y: 0, z: 0 }, { x: 10, y: 5, z: 0 }, 
            { x: 9, y: 9, z: 0 }, { x: 0, y: 9, z: 0 }
        ];

        debugger;

        const hull = computeConvexHull(points);
        console.log(hull);

        expect(hull).toEqual(expect.arrayContaining(expectedHull));
        expect(hull.length).toBe(expectedHull.length);
    });

    test('Convex Hull should return correct points in order', () => {
        const points: Vector3d[] = [
            { x: 1, y: 1, z: 0 }, { x: 2, y: 2, z: 0 }, { x: 3, y: 3, z: 0 }, { x: 4, y: 4, z: 0 },
            { x: 5, y: 5, z: 0 }, { x: 6, y: 1, z: 0 }, { x: 7, y: 2, z: 0 }, { x: 8, y: 3, z: 0 },
            { x: 9, y: 4, z: 0 }, { x: 10, y: 5, z: 0 }, { x: 5, y: 6, z: 0 }, { x: 4, y: 2, z: 0 },
            { x: 3, y: 1, z: 0 }, { x: 0, y: 0, z: 0 }, { x: 10, y: 0, z: 0 }
        ];

        const expectedHull = [
            { x: 0, y: 0, z: 0 }, { x: 10, y: 0, z: 0 }, { x: 10, y: 5, z: 0 },
            { x: 5, y: 6, z: 0 }, { x: 0, y: 0, z: 0 }
        ];

        const hull = computeConvexHull(points);

        expect(hull).toEqual(expect.arrayContaining(expectedHull));
    });
});