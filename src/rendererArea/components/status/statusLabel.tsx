import React from "react"

interface StatusLabelProps {
    isRedLight: boolean,
    redLightMessage: string,
    greenLightMessage: string,
    redLightColor?: string,
    greenLightColor?: string,
}

export const StatusLabel:React.FC<StatusLabelProps> = ({isRedLight, redLightMessage, greenLightMessage, redLightColor='#ff4a3d', greenLightColor='#78ff85'}) => {
    return (
        <div style={{borderRadius: 4, paddingLeft: 4, paddingRight: 4, background: isRedLight ? redLightColor : greenLightColor, color: isRedLight ? 'white' : 'black'}}>
            {isRedLight ? redLightMessage : greenLightMessage}
        </div>
    )
}
