import { useModalOveralyStore } from "./modalOverlayStore"

export const useModalOveralyUtils = () => {
    const {
        toggleMode,
        setMode,
        resetProps
    } = useModalOveralyStore();

    const withModalOverlay = async (mode: 'modal'|'loading' = 'modal', action : () => Promise<void>) => {
        setMode(mode);
        toggleMode(true);
        try {
            await action();
        } finally {
            toggleMode(false);
            resetProps();
        }
    };

    return { withModalOverlay }
}