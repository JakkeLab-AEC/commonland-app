import { LandInfoDTO } from "@/dto/serviceModel/landInfo";
import { LandInfoModifyOption } from "@/mainArea/repository/landInfoRepository";
import { create } from "zustand";

interface ProjectPageStoreProps {
    projectName?: string
    epsgCode?: number
    fetchLandInfo: (callback?: (data: LandInfoDTO) => void) => Promise<void>,
    updateLandinfo: (option: LandInfoModifyOption, updateDB?: boolean) => Promise<void>,
    setProjectName: (name: string) => void;
    setEpsgCode: (epsg: number) => void;
}

const initialState = {
    projectName: undefined,
    epsgCode: undefined,
};

const createProjectPageStore = create<ProjectPageStoreProps>((set, get) => ({
    ...initialState,
    setProjectName: (name: string) => set({ projectName: name }),
    setEpsgCode: (epsg: number) => set({ epsgCode: epsg }),
    fetchLandInfo: async (callback?: (data: LandInfoDTO) => void) => {
        const fetchJob = await window.electronLandInfoAPI.fetchLandInfo();
        if(!fetchJob || !fetchJob.result) return;

        set(() => ({
            projectName: fetchJob.landInfo.name,
            epsgCode: fetchJob.landInfo.epsg
        }));

        if(callback) {
            callback(fetchJob.landInfo);
        }
    },
    updateLandinfo: async (option: LandInfoModifyOption, updateDB = true) => {
        if(updateDB) {
            const updateJob = await window.electronLandInfoAPI.updateLandInfo(option);
            if(!updateJob || !updateJob.result) return;
        }

        set(() => ({
            projectName: option.name,
            epsgCode: option.epsg
        }));
    },
}));

export const useProjectPageStore = () => {
    const store = createProjectPageStore();
    return store;
};