import React from 'react';
import './dropdownStyle.css';

export default function Dropdown({items, width, onSelectHandler}:{items: string[], width?: number|string, onSelectHandler?:(e:React.MouseEvent<HTMLSelectElement>) => void}) {
    
    
    return (
        <select id="btn-neutral" onSelect={onSelectHandler} style={{width: width, borderRadius: 12}}>
            {items.map((item, index) => {
                return <option key={index} value={item}>{item}</option>
            })}
        </select>
    )
}