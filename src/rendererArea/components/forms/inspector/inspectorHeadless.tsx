import React, { ReactNode } from "react";
import './inspectorStyles.css';

interface InspectorProps {
    children?: ReactNode
    width: number,
    height: number,
    onClickCloseHandler?: () => void;
}

export const InspectorHeadless:React.FC<InspectorProps> = ({
    children, 
    width = 120, 
    height = 160
}) => {
    return (
        <div 
            className="flex flex-col border border-silver rounded-lg bg-white user-select-none"
            style={{
                width: width ? `${width}px` : 'auto', 
                height: height ? `${height}px` : 'auto',
            }}>
            {/* Contents */}
            <div className="flex-grow w-full">
                {children}
            </div>
        </div>
    )
}