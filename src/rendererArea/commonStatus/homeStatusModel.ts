import { ReactNode } from "react";
import { create } from "zustand";
import { v4 as uuidv4 } from 'uuid';

interface homeStatusProps {
    osName: string;
    mode: 'dist'|'dev';
    currentHomeId: string;
    inspectorVisibility: boolean,
    inspectorSize: {width: number, height: number},
    inspetorContent: ReactNode;
    inspectorTitle: string,
    inspectorClosingListeners: Array<() => void>,
    inspectorPositonTop: number,
    inspectorPositonLeft: number,
    currentSidebarHeight: number,
    setOSName: (name: string) => void,
    setMode: (mode: 'dist'|'dev') => void,
    updateHomeId: () => void,
    setInspectorTitle: (title: string) => void,
    setInspectorVisiblity: (visiblity: boolean) => void,
    setInspectorSize: (option: {width: number, height: number}) => void,
    setInspectorContent: (content: ReactNode) => void,
    setInspectorPosition: (top?: number, left?: number, minBottom?: number) => void;
    registerInspectorClosingListner: (listener: () => void) => void,
    resetInspector: () => void,
    updateSidebarHeight: (height: number) => void,
}

export const useHomeStore = create<homeStatusProps>((set, get) => ({
    osName: '',
    mode: 'dev',
    currentHomeId: uuidv4(),
    inspectorVisibility: false,
    inspectorSize: {width: 360, height: 420},
    inspetorContent: null,
    inspectorTitle: "Default Inspector",
    inspectorClosingListeners: [],
    inspectorPositonTop: 64,
    inspectorPositonLeft: 340,
    currentSidebarHeight: 0,
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
    setInspectorPosition:(top?: number, left?: number, minBottom?: number) => {
        let [updatedTop, updatedLeft] = [get().inspectorPositonTop, get().inspectorPositonLeft]
        if(top)
            updatedTop = top;

        if(left)
            updatedLeft = left;

        if(minBottom)
            updatedTop -= minBottom;
        
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
    resetInspector:() => {
        set(() => {
            return {
                inspectorPositonTop: 64,
                inspectorPositonLeft: 340,
                inspectorSize: {width: 360, height: 420},
            }
        })
    },
    setOSName: (name: string) => {
        set(() => {
            return {osName: name}
        })
    },
    setMode: (mode: 'dist'|'dev') => {
        set(() => {
            return {mode : mode}
        })
    },
    updateSidebarHeight: (height: number) => {
        set(() => {
            return {currentSidebarHeight: height}
        });
    }
}));