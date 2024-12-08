import React, { ReactNode, useEffect } from "react"
import { useModalOveralyStore } from "./modalOverlayStore";

interface ModalOverlayProps {
    mode?: 'modal'|'loading'
}

const modalStyles: Map<string, React.CSSProperties> = new Map([
    [
        'modal', {
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 1, 
        background: 'rgba(1, 1, 1, 0.5)',
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
        zIndex: 1, 
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }],
]);

export const ModalOverlay:React.FC<ModalOverlayProps> = ({mode='modal'}) => {
    const {
        isOpened,
        modalContent,
        resetProps,
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
