import { create } from "zustand";

interface SidebarStoreProps {
    navigationIndex: number,
    setNaviationIndex: (index: number) => void,
}

export const useSidebarStore = create<SidebarStoreProps>((set, get) => ({
    navigationIndex: 0,
    setNaviationIndex: (index: number) => {
        set(() => {return {navigationIndex: index}});
    },
}));