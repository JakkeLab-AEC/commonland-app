import React from 'react'
import './buttonNegativeStyle.css'

interface ButtonNegativeProps {
    text: string, 
    isEnabled: boolean,
    width?: number|string, 
    height?: number|string, 
    onClickHandler?:(e:React.MouseEvent<HTMLButtonElement>) => void
}

export const ButtonNegative:React.FC<ButtonNegativeProps> = ({text, isEnabled, width, height, onClickHandler}) => {
    const buttonHeight = !height ? 24 : height;

    return (
        <button 
            className={isEnabled ? 'btn-negative-enabled' : 'btn-negative-disabled'} 
            onClick={isEnabled ? onClickHandler : () => {}} 
            style={{width: width, borderRadius: 4, height: buttonHeight}} 
            disabled={!isEnabled}>
            {text}
        </button>
    )
}