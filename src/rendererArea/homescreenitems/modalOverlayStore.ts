import { ReactNode } from "react";
import { create } from "zustand";

interface ModalOveralyStore {
    isOpened: boolean,
    modalContent: ReactNode,
    progress: number,
    mode?: 'modal'|'loading',
    toggleMode: (mode: boolean) => void,
    updateModalContent: (modalContent: ReactNode) => void,
    updateProgress?: (progress: number) => void,
    setMode: (mode: 'modal'|'loading') => void,
    resetProps: () => void,
}


export const useModalOveralyStore = create<ModalOveralyStore>((set, get) => ({
    isOpened: false,
    modalContent: null,
    progress: 0,
    mode: 'modal',
    toggleMode: (mode: boolean) => {
        set(() => {return {isOpened: mode}});
    },
    updateModalContent: (modalContent: ReactNode) => {
        set(() => {return {modalContent: modalContent}});
    },
    updateProgress: (progress: number) => {
        set(() => ({ progress }));
    },
    setMode:(mode: 'modal'|'loading') => {
        set(() => ({mode: mode}));
    },
    resetProps: () => {
        set(() => {
            return {
                isOpened: false,
                modalContent: null,
                progress: 0,
                mode:'modal'
            }
        })
    },
}));