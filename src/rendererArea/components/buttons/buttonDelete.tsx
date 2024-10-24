import React from "react";
import './buttonDeleteStyle.css';

interface ButtonDeleteProps {
    id: string|number;
    onDeleteHandler?: (id: string|number) => void;
}

export const ButtonDelete:React.FC<ButtonDeleteProps> = ({id, onDeleteHandler}) => {
    const onDeleteWrapper = () => {
        if(onDeleteHandler) onDeleteHandler(id);
    }
    
    return (
        <button onClick={onDeleteWrapper} className="button-delete">
            <svg viewBox="0 0 20 20" className="button-delete-svg">
                <path d="M6 6 L14 14 M14 6 L6 14" />
            </svg>
        </button>
    )
}