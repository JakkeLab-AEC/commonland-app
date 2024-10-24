import React, { useEffect, useRef } from "react"
import './contextMenuStyle.css';

export interface ContextMenuItemProp {
    displayString: string,
    id?: string|null,
    isActionIdBased: boolean
    action?: (e: string|null) => void,
    closeHandler: () => void,
}

export const ContextMenuItem: React.FC<ContextMenuItemProp> = ({displayString, isActionIdBased = false, id, action, closeHandler}) => {
    const onClickWrapper = () => {
        if(!action) {
            closeHandler();
            return;
        }

        if(isActionIdBased) {
            if(id != null) {
                action(id);
            }
        } else {
            action(null);
        }

        closeHandler();
    }

    return (
        <div className="context-menu-item" onClick={onClickWrapper}>
            {displayString}
        </div>
    )
}

export interface ContextMenuProp {
    menuItemProps: ContextMenuItemProp[],
    width: number
    onClose: () => void;
}

export const ContextMenu:React.FC<ContextMenuProp> = ({menuItemProps, width = 120, onClose}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    // Hook to handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose(); // Close the menu when clicked outside
            }
        };

        // Attach the event listener
        document.addEventListener('mousedown', handleClickOutside);

        // Cleanup the event listener on component unmount
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);
    const length = menuItemProps.length;
    let cnt = 0;
    return (
        <div ref={menuRef} style={{position: 'absolute', width: width}} className="context-menu flex flex-col w-full p-2">
            {menuItemProps.map(item => {
                return (
                    <div>
                        <ContextMenuItem 
                            displayString={item.displayString} 
                            isActionIdBased={item.isActionIdBased} 
                            id={item.id ? item.id : null}
                            action={item.action}
                            closeHandler={onClose}/>
                        {cnt++ < length - 1 ? <hr/> : null}
                    </div>
                )
            })}
        </div>
    )
}
