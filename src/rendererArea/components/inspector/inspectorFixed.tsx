import React, { ReactNode } from "react";
import './inspectorStyles.css';

interface InspectorProps {
    title: string,
    children?: ReactNode
    width: number,
    height: number,
    onClickCloseHandler?: () => void;
}

export const InspectorFixed:React.FC<InspectorProps> = ({
    children, 
    onClickCloseHandler, 
    title = 'Default Inspector', 
    width = 120, 
    height = 160
}) => {
    const onClickWrapper = () => {
        if(onClickCloseHandler) {
            onClickCloseHandler();
        }
    }

    return (
        <div 
            className="flex flex-col border border-silver rounded-lg bg-white user-select-none"
            style={{
                width: width ? `${width}px` : 'auto', 
                height: height ? `${height}px` : 'auto',
            }}>
            {/* Header */}
            <div className="flex flex-row h-10 border-b border-silver items-center p-2">
                <div className="flex-grow text-gray-800 font-semibold">
                    {title}
                </div>
                <div 
                    className="cursor-pointer"
                    onClick={onClickWrapper} 
                    aria-label="Close">
                    <svg viewBox="0 0 20 20" className="w-4 h-4 text-gray-600">
                        <path d="M6 6 L14 14 M14 6 L6 14" stroke="currentColor" strokeWidth="2" />
                    </svg>
                </div>
            </div>
            {/* Contents */}
            <div className="flex-grow w-full">
                {children}
            </div>
        </div>
    )
}
