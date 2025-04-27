import { DefaultDimensions } from "@/rendererArea/api/three/defaultConfigs/DefaultDimensionConfigs";
import { SceneController } from "@/rendererArea/api/three/SceneController";
import { useModalOveralyStore } from "@/rendererArea/homescreenitems/modalOverlayStore";
import { useTopoMakerStore } from "@/rendererArea/sidebar/pages/topography/inspector/inspectorTopoMakerStore";
import React, { useEffect, useRef } from "react"

export const ThreeViewPort = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;

    useEffect(() => {
        if(canvasRef.current) {
            const renderer = SceneController.CreateRenderer(canvasRef.current);
            const rendererConfig = SceneController.InitiateRenderer(renderer);
            SceneController.setInstance(rendererConfig);
            DefaultDimensions.initiate();
        }

        // ViewPort Resizer
        const handleResize = () => {
            if(canvasRef.current) {
                const canvasWidth = window.innerWidth;
                const canvasHeight = window.innerHeight;
                canvasRef.current.width = canvasWidth;
                canvasRef.current.height = canvasHeight;
                SceneController.getInstance().resize(canvasWidth, canvasHeight);
            }
        }
        
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        }
    });

    return (
        <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} />
    )
}
