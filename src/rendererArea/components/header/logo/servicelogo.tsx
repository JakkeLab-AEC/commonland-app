import React from "react";

export default function ServiceLogo({appName}: {appName: string}) {
    return (
        <div className="flex flex-row gap-4 items-center">
            <div style={{fontWeight: 600, fontSize: 20, userSelect: 'none'}}>
                {appName}
            </div>
        </div>
    )
}