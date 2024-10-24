import React from 'react';
import './buttonPositiveStyle.css';

interface ButtonPositiveProps {
    text: string,
    isEnabled: boolean,
    width?: number|string, 
    height?: number|string, 
    onClickHandler?:(e:React.MouseEvent<HTMLButtonElement>) => void
}
export const ButtonPositive:React.FC<ButtonPositiveProps> = ({text, isEnabled, width, height, onClickHandler}) => {
    const buttonHeight = !height ? 24 : height;
    
    return (
        <button 
            className={isEnabled ? 'btn-positive-enabled' : 'btn-positive-disabled'} 
            onClick={isEnabled ? onClickHandler : null} 
            style={{width: width, borderRadius: 4, height: buttonHeight}} 
            disabled={!isEnabled}>
            {text}
        </button>
    )
}