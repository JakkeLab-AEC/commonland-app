import { Vector2d } from '@/mainArea/types/vector';

type EPSGCodeSet = {[key: number]: {origin?: Vector2d, name?: string, comment?: string}}

const defaultEPSG = 4326;

const epsgCodes:EPSGCodeSet = {
    4326: {},
    5186: {},
    5174: {},
}

export const EPSGCodes = {
    defaultEPSG,
    epsgCodes
}