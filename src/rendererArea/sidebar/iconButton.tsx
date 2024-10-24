import React from "react";

export default function Button(
    {menuName, index, isEnabled, navigateHandler}:
    {menuName: string, index: number, isEnabled: boolean, navigateHandler:(index: number) => void},) {
    const menuIndex = index;
    
    const onClickHandler = () => {
        navigateHandler(menuIndex);
    }

    // Color Settings
    const colorSet = isEnabled ? {background: 'white', foreground: '#0045BB'}
                               : {background: 'silver', foreground: 'grey'}
    
    return (
        <button className="w-12 h-12" style={{backgroundColor: colorSet.background, color: colorSet.foreground}} onClick={onClickHandler}>
            {menuName}
        </button>
    )
}