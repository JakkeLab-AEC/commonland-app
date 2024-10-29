import { ReactNode } from "react";
import { create } from "zustand";

interface ModalOveralyStore {
    isOpened: boolean,
    modalContent: ReactNode,
    toggleMode: (mode: boolean) => void,
    updateModalContent: (modalContent: ReactNode) => void,
    resetProps: () => void,
}


export const useModalOveralyStore = create<ModalOveralyStore>((set, get) => ({
    isOpened: false,
    modalContent: null,
    toggleMode: (mode: boolean) => {
        set(() => {return {isOpened: mode}});
    },
    updateModalContent: (modalContent: ReactNode) => {
        set(() => {return {modalContent: modalContent}});
    },
    resetProps: () => {
        set(() => {
            return {
                isOpened: false,
                modalContent: null,
            }
        })
    }
}));