import React, { ReactNode, useEffect } from "react"
import { useModalOveralyStore } from "./modalOverlayStore";

export const ModalOverlay = () => {
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
            style={{
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%', 
                zIndex: 1, 
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                }}>
            <div style={{position:'relative'}}>
                {modalContent}
            </div>
        </div>
        )
    )
}
