import { Boring } from "@/mainArea/models/serviceModels/boring/boring";
import { Topo } from "@/mainArea/models/serviceModels/topo/Topo";
import { DXFWriter } from "./dxfwriter";

export const ExportTopoAsDXF = (topo:Topo) => {
    const writer = new DXFWriter();
}

export const ExportBoringAsDXF = (boring: Boring) => {

}