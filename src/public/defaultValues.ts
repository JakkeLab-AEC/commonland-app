import { LandInfoModifyOption } from "@/mainArea/repository/landInfoRepository";
import { EPSGCodes } from "./epsgCodes";

const DEFAULT_LANDINFO: Required<LandInfoModifyOption> = {
    name: "New Land 1",
    epsg: EPSGCodes.defaultEPSG
}

export const DEFAULT_VALUES = {
    DEFAULT_LANDINFO
}