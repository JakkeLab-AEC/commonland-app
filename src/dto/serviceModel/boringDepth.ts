import { Vector2d } from "@/mainArea/types/vector";

export interface BoringDepth {
    id: string,
    name: string,
    depthName: string;
    location: Vector2d,
    level: number
}