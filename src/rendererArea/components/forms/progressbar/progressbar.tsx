import React from "react"

interface ProgressBarProps {
    value: number
}

export const ProgressBar:React.FC<ProgressBarProps> = ({value}) => {
    const styleBackground: React.CSSProperties = {
        backgroundColor: '#ebebeb',
        borderRadius: 4,
        borderColor: 'silver',
        borderWidth: 1,
        height: 24,
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        position:'relative'
    };

    const styleProgressed: React.CSSProperties = {
        backgroundColor: '#92FF9C',
        height: '100%',
        width: `${Math.min(100, Math.max(0, value))}%`,
        transition: 'width 0.3s ease-in-out',
    };

    const textStyle: React.CSSProperties = {
        position:'absolute',
        width: '100%',
        textAlign: 'center',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '14px'
    };

    return (
        <div style={styleBackground}>
            <div style={styleProgressed}></div>
            <div style={textStyle}>{value.toFixed(2)}%</div>
        </div>
    )    
}