import React, { useState, ReactNode } from "react";

type FoldableListProps = {
    title: string;
    children?: ReactNode;
}

export const FoldableControl:React.FC<FoldableListProps> = ({title, children}) => {
    const [isOpen, setIsOpen] = useState(true);

    const toggleList = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="h-full w-full" style={{position: 'relative'}}>
          <div className="flex flex-row gap-2 mt-1 mb-1">
            <div>
                {title}
            </div>
            <hr className="flex-grow self-center" style={{borderColor: 'black', borderTopWidth: 1, borderStyle:'dashed'}}/>
            <div onClick={toggleList} style={{ cursor: 'pointer', userSelect: 'none'}} >
                {isOpen ? '▲' : '▼'}
            </div>
          </div>
          {isOpen && (
            <div className="flex flex-col h-full gap-2 mb-2">
                {children}
            </div>
          )}
        </div>
    );
}
