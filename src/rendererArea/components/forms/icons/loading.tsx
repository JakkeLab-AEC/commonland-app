import React from "react"

export const IconLoading: React.FC = () => {
    const circles = Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30) * (Math.PI / 180); // 30도씩 회전
        const r = 8; // 중심으로부터 거리
        const x = 12 + r * Math.cos(angle);
        const y = 12 + r * Math.sin(angle);
        const opacity = (i + 1) / 12; // 흐려지는 느낌

        return (
            <circle
                key={i}
                cx={x}
                cy={y}
                r="2"
                fill="currentColor"
                opacity={opacity}
            />
        );
    });

    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
        >
            {circles}
        </svg>
    );
};