import React, { ReactNode } from "react";
import './inspectorStyles.css';

interface InspectorProps {
    title: string,
    children?: ReactNode
    width: number,
    height: number,
    onClickCloseHandler?: () => void;
}

export const Inspector:React.FC<InspectorProps> = ({children, onClickCloseHandler, title = 'Default Inspector', width = 120, height = 160}) => {
    const onClickWrapper = () => {
        if(onClickCloseHandler) {
            onClickCloseHandler();
        }
    }

    return (
        <div style={{borderRadius: 8, width: width, borderWidth: 1, borderColor: 'silver', height: height, backgroundColor:'white', userSelect: 'none'}} className="flex flex-col h-full inspector-body">
            <div className='flex flex-row p-2 h-[40px]' style={{borderBottomWidth: 1}}>
                {/* Header */}
                <div className="flex-grow">
                    {title}
                </div>
                <div className="icon-close" onClick={onClickWrapper} style={{cursor: 'pointer'}}>
                    <svg viewBox="0 0 20 20">
                        <path d="M6 6 L14 14 M14 6 L6 14" />
                    </svg>
                </div>
            </div>
            <div className='flex-grow w-full h-full'>
                {children}
            </div>
        </div>
    )
}
