import { ReactNode } from "react";
import { create } from "zustand";

interface ModalOveralyStore {
    isOpened: boolean,
    modalContent: ReactNode,
    progress: number,
    toggleMode: (mode: boolean) => void,
    updateModalContent: (modalContent: ReactNode) => void,
    updateProgress?: (progress: number) => void,
    resetProps: () => void,
}


export const useModalOveralyStore = create<ModalOveralyStore>((set, get) => ({
    isOpened: false,
    modalContent: null,
    progress: 0,
    toggleMode: (mode: boolean) => {
        set(() => {return {isOpened: mode}});
    },
    updateModalContent: (modalContent: ReactNode) => {
        set(() => {return {modalContent: modalContent}});
    },
    updateProgress: (progress: number) => {
        set(() => ({ progress }));
    },
    resetProps: () => {
        set(() => {
            return {
                isOpened: false,
                modalContent: null,
                progress: 0,
            }
        })
    },
    startTimer: (listener: (e: number) => void) => {
        
    }
}));