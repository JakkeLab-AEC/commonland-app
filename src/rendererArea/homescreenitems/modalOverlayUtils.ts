import { useModalOveralyStore } from "./modalOverlayStore"

export const useModalOveralyUtils = () => {
    const {toggleMode} = useModalOveralyStore();

    const withModalOverlay = async (action : () => Promise<void>) => {
        toggleMode(true);
        try {
            await action();
        } finally {
            toggleMode(false);
        }
    };

    return { withModalOverlay }
}