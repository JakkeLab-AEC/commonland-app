import { DBError } from "../../../public/databaseErrors";
import { BoringDTO } from "../../../dto/serviceModel/BoringDTO";

export interface IElectronIPCBoringData {
    insertBoring: (boringDto: BoringDTO) => Promise<{result: boolean, message?: string}>;
    fetchAllBorings: () => Promise<{result: boolean, message?: string, fetchedBorings: BoringDTO[]}>;
    updateBoring: (boringDto: BoringDTO) => Promise<{result: boolean, message?: string, updateError?: DBError}>;
    updateBorings: (boringDtos: BoringDTO[]) => Promise<{result: boolean, message?: string, updateError?: DBError}>;
    updateBoringBatch:(idAndOptions: {id: string, option: boolean}[]) => Promise<{result: boolean, message?: string}>;
    searchBoringNamePattern: (prefix: string, index:number) => Promise<{result: boolean, message?: string, searchedNames: string[]}>;
    searchBoringName: (name: string, id?: string) => Promise<{result: boolean, message?: string, error?: boolean}>;
    removeBoring: (ids: string[]) => Promise<{result: boolean, message?: string}>;
    getAllLayerColors: () => Promise<{result: boolean, message?: string, layerColors?: [string, number][]}>;
    updateLayerColor: (layerName: string, colorIndex: number) => Promise<{result: boolean, message?: string}>;
}

declare global {
    interface Window {
        electronBoringDataAPI: IElectronIPCBoringData;
    }
}