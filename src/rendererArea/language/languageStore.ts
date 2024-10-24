import { create } from "zustand";
import { displayStringsGlobal, LanguageConfig, LocaleCodes } from "./languageConfig";

interface LanguageStoreProps extends LanguageConfig {
    setCurrentLanguageMode: (code: LocaleCodes) => void,
    findValue: (componentName: string, itemName: string) => string
}

export const useLanguageStore = create<LanguageStoreProps>((set, get) => ({
    localeCode: 'kr',
    displayStrings: displayStringsGlobal,
    setCurrentLanguageMode: (code: LocaleCodes) => {
        set(() => {
            return {localeCode: code}
        })
    },
    findValue: (componentName: string, itemName: string) => {
        const status = get();
        return status.displayStrings.get(`${componentName}-${itemName}-${status.localeCode}`)?.displayString || 'NO-TRNS';
    }
}));