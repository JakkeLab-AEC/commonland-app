import { create } from "zustand";

interface ProjectStoreProps {
    projectName: string,
    epsgCode: string,
    updateProjectName: (name: string) => void,
    setEPSGCode: 
}

const useProjectStore = create<ProjectStoreProps>((set, get) => ({

}));