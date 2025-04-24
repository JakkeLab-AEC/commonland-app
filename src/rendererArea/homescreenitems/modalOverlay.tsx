import React, { ReactNode, useEffect } from "react"
import { useModalOveralyStore } from "./modalOverlayStore";

const modalStyles: Map<string, React.CSSProperties> = new Map([
    [
        'modal', {
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 3, 
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }],
    [
        'loading', {
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 3, 
        background: 'rgba(255, 255, 255, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }],
]);

export const ModalOverlay:React.FC = () => {
    const {
        isOpened,
        modalContent,
        resetProps,
        mode
    } = useModalOveralyStore();

    useEffect(() => {
        return () => {
            resetProps();
        };
    }, [])
    return (
        isOpened && (
        <div 
            style={modalStyles.get(mode)}>
            <div style={{position:'relative'}}>
                {modalContent}
            </div>
        </div>
        )
    )
}
