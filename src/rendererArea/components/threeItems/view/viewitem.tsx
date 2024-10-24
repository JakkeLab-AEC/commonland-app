import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import './viewitem.css';

export default function ViewListItem(
    {index, text, deleteMode, renameHandler, deleteHandler, onClickToChangeView}:
    {index: number, text: string, deleteMode: boolean, renameHandler?:(index:number, name:string) => void, deleteHandler?:(index:number) => void, onClickToChangeView:(index: number) => void}) {
        const [renameMode, setRenameMode] = useState<boolean>(false);
        const [displayName, setDisplayName] = useState<string>(text);
        const [oldName, setOldName] = useState<string>(text);
        const [newName, setNewName] = useState<string>(text);
        const inputRef = useRef<HTMLInputElement>(null);
        
        const renameCancel = () => {
            setRenameMode(false);
            setDisplayName(oldName); // 원래 이름으로 되돌림
        }
        
        const toggleRenameMode = () => {
            setOldName(displayName);
            setRenameMode(true);
        }

        const sendRenamedName = () => {
            setRenameMode(false);
            setDisplayName(newName);
            if (renameHandler) {
                renameHandler(index, newName);
            }
        }

        const saveNewName = (e:ChangeEvent<HTMLInputElement>) => {
            setNewName(e.target.value);
        }

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                sendRenamedName();
            } else if (e.key === 'Escape') {
                renameCancel();
            }
        }

        const handleBlur = () => {
            renameCancel();
        }

        const deleteWrapper = () => {
            if (deleteHandler) {
                deleteHandler(index);
            }
        }

        const onClickToChangeViewWrapper = () => {
            onClickToChangeView(index);
        }

        useEffect(() => {
            if(renameMode && inputRef.current) {
                inputRef.current.focus();
            }
        }, [renameMode]);

        return (
        <div className="flex flex-col w-[112px] h-[120px] mb-0" id="view-box" style={{fontSize: 12}}>
            <button className="h-[88px] view-thumb" onClick={onClickToChangeViewWrapper}>
                img here
            </button>
            <div className="h-[32px] flex flex-row items-center pl-1 pr-1 justify-between" id="view-label">
                {!renameMode && <button id="view-label-editable" onClick={toggleRenameMode} disabled={deleteMode}>
                    {displayName}
                </button>}
                {renameMode && 
                    <input 
                        type="text"
                        defaultValue={displayName}
                        id="view-label-edit"
                        onChange={saveNewName} 
                        onKeyDown={handleKeyDown}
                        onBlur={handleBlur}
                        ref={inputRef}
                    />
                }
                {/* Rename Ok */}
                {renameMode && <button onClick={sendRenamedName}>
                    <svg viewBox="0 0 20 20" id="editmode-icon">
                        <path d="M6 9 L9 12 L14 7" />
                    </svg>
                </button>}
                {/* Rename Cancel */}
                {renameMode && <button onClick={renameCancel}>
                    <svg viewBox="0 0 20 20" id="editmode-icon">
                        <path d="M6 6 L14 14 M14 6 L6 14" />
                    </svg>
                </button>}
                {/* Delete */}
                {deleteMode && <button onClick={deleteWrapper}>
                    <svg viewBox="0 0 20 20" id="editmode-icon">
                        <path d="M6 6 L14 14 M14 6 L6 14" />
                    </svg>
                </button>}
            </div> 
        </div>
    )
}