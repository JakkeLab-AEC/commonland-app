import React from 'react';
import './buttonNeutralStyle.css';

export default function ButtonNeutral({text, width, isEnabled, onClickHandler}:{text: string, width?: number|string, isEnabled: boolean, onClickHandler?:(e:React.MouseEvent<HTMLButtonElement>) => void}) {
    return (
        <button className='btn-neutral' onClick={onClickHandler} style={{width: width, borderRadius: 4}} disabled={!isEnabled}>
            {text}
        </button>
    )
}