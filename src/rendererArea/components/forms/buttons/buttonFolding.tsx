import React from 'react';
import './buttonFoldingStyle.css';

export default function ButtonFolding(
    {text, width, isClosed, onClickHandler}
    :{text: string, width?: number|string, isClosed:boolean, onClickHandler?:(e:React.MouseEvent<HTMLButtonElement>) => void}) {
    return (
        <div id="btn-folding" className='flex flex-row items-center' style={{width: width, borderRadius: 4}}>
            <button onClick={onClickHandler}>
                <svg viewBox='0 0 16 16' className={isClosed ? 'arrow-svg' : 'arrow-svg-rotated'}>
                    <path d="M10 12 6 8 10 4"/>
                </svg>
            </button>
            <div>
                {text}
            </div>
        </div>
    )
}