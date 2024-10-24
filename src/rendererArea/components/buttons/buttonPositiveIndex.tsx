import React from 'react';
import './buttonPositiveStyle.css';

export default function ButtonPositiveIndex(
    {index, text, width, height, onClickHandler}:
    {index:number, text: string, width?: number|string, height?: number|string, onClickHandler?:(index: number) => void}) {
    const buttonHeight = !height ? 24 : height;
    const onClickWrapper = () => {
        onClickHandler(index);
    }
    return (
        <button id="btn-positive" onClick={onClickWrapper} style={{width: width, borderRadius: 4, height: buttonHeight}}>
            {text}
        </button>
    )
}