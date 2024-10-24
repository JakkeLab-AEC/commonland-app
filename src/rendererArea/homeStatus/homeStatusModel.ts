import { ReactNode } from "react";
import { create } from "zustand";
import { v4 as uuidv4 } from 'uuid';

interface homeStatusProps {
    currentHomeId: string;
    inspectorVisibility: boolean,
    inspectorSize: {width: number, height: number},
    inspetorContent: ReactNode;
    inspectorTitle: string,
    inspectorClosingListeners: Array<() => void>,
    inspectorPositonTop: number,
    inspectorPositonLeft: number,
    updateHomeId: () => void,
    setInspectorTitle: (title: string) => void,
    setInspectorVisiblity: (visiblity: boolean) => void,
    setInspectorSize: (option: {width: number, height: number}) => void,
    setInspectorContent: (content: ReactNode) => void,
    setInspectorPosition: (top?: number, left?: number) => void;
    registerInspectorClosingListner: (listener: () => void) => void,
}

export const useHomeStore = create<homeStatusProps>((set, get) => ({
    currentHomeId: uuidv4(),
    inspectorVisibility: false,
    inspectorSize: {width: 360, height: 420},
    inspetorContent: null,
    inspectorTitle: "Default Inspector",
    inspectorClosingListeners: [],
    inspectorPositonTop: 64,
    inspectorPositonLeft: 340,
    setInspectorVisiblity: (visibility: boolean) => {
        const listeners = get().inspectorClosingListeners;
        if(!visibility) {
            listeners.forEach(listener => listener());
        }

        set(() => {
            return {
                inspectorVisibility: visibility,
                inspectorClosingListeners: [],
            }
        })
    },
    setInspectorSize: (option: {width: number, height: number}) => {
        const {width, height} = option;
        set(() => {
            return {inspectorSize:{width: width, height: height}}
        })
    },
    setInspectorTitle: (title: string) => {
        set(() => {
            return {inspectorTitle : title}
        })
    },
    setInspectorContent: (content: ReactNode) => {
        set(() => {
            return {inspetorContent: content}
        })
    },
    registerInspectorClosingListner: (listener: () => void) => {
        const listeners = [...get().inspectorClosingListeners];
        listeners.push(listener);

        set(() => {
            return {
                inspectorClosingListeners: listeners
            }
        })
    },
    setInspectorPosition:(top?: number, left?: number) => {
        let [updatedTop, updatedLeft] = [get().inspectorPositonTop, get().inspectorPositonLeft]
        if(top)
            updatedTop = top;

        if(left)
            updatedLeft = left;
        
        set(() => {
            return {
                inspectorPositonTop: updatedTop,
                inspectorPositonLeft: updatedLeft,
            }
        })
    },
    updateHomeId:() => {
        set(() => {return {currentHomeId: uuidv4()}});
    },
}));