import { LandInfoModifyOption } from "@/mainArea/repository/landInfoRepository";
import { create } from "zustand";

interface ProjectPageStoreProps {
    projectName?: string
    epsgCode?: number
    fetchLandInfo: () => Promise<void>,
    updateLandinfo: (option: LandInfoModifyOption) => Promise<void>,
    setProjectName: (name: string) => void;
    setEpsgCode: (epsg: number) => void;
}

const initialState = {
    projectName: '',
    epsgCode: 0,
};

const createProjectPageStore = create<ProjectPageStoreProps>((set, get) => ({
    ...initialState,
    setProjectName: (name: string) => set({ projectName: name }),
    setEpsgCode: (epsg: number) => set({ epsgCode: epsg }),
    fetchLandInfo: async () => {
        const fetchJob = await window.electronLandInfoAPI.fetchLandInfo();
        if(!fetchJob || !fetchJob.result) return;

        set(() => ({
            projectName: fetchJob.landInfo.name,
            epsgCode: fetchJob.landInfo.epsg
        }));
    },
    updateLandinfo: async (option: LandInfoModifyOption) => {
        const updateJob = await window.electronLandInfoAPI.updateLandInfo(option);
        console.log(updateJob);
        if(!updateJob || !updateJob.result) return;

        set(() => ({
            projectName: option.name,
            epsgCode: option.epsg
        }));
    },
}));

export const useProjectPageStore = () => {
    const store = createProjectPageStore();
    // Store가 생성될 때 fetchLandInfo를 호출합니다.
    store.fetchLandInfo();
    return store;
};