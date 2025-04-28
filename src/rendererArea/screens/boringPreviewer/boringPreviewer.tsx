import { ButtonPositive } from "@/rendererArea/components/forms/buttons/buttonPositive";
import { SceneController } from "../../../rendererArea/api/three/SceneController";
import { useLanguageStore } from "../../../rendererArea/language/languageStore";
import { useEffect, useRef, useState } from "react";

interface BoringPreviewerProp {
    boringName: string
}

export const BoringPreviewer: React.FC<BoringPreviewerProp> = ({ boringName }) => {
    const { findValue } = useLanguageStore();
    const [isPlaneMode, togglePlaneMode] = useState<boolean>(true);
    const canvas3dRef = useRef<HTMLCanvasElement>(null);
    const canvas2dRef = useRef<HTMLCanvasElement>(null);

    const toggleMode = () => {
        togglePlaneMode(prevMode => !prevMode);
    };

    const sketcnOn2dCanvas = () => {
        if(canvas2dRef.current) {
            const canvas = canvas2dRef.current;
            const ctx = canvas.getContext('2d');
            ctx.beginPath();
            ctx.moveTo(75, 50);
            ctx.lineTo(100, 75);
            ctx.lineTo(100, 25);
            ctx.fill();
        }
    }

    useEffect(() => {
        if (!isPlaneMode && canvas3dRef.current) {
            const renderer = SceneController.CreateRenderer(canvas3dRef.current);
            const rendererConfig = SceneController.InitiateRenderer(renderer);
            const threeInstance = SceneController.registerInstance('boringPreviewer3d', rendererConfig);
            
            // 캔버스 크기 설정
            const canvasParent = canvas3dRef.current.parentElement;
            if (canvasParent) {
                const { clientWidth, clientHeight } = canvasParent;
                threeInstance.getRenderer().setSize(clientWidth, clientHeight);
                threeInstance.resize(clientWidth, clientHeight);
            }
        } else if (isPlaneMode && canvas2dRef.current) {
            const canvasParent = canvas2dRef.current.parentElement;
            const { clientWidth, clientHeight } = canvasParent;
            if (canvasParent) {
                canvas2dRef.current.width = clientWidth;
                canvas2dRef.current.height = clientHeight;
                sketcnOn2dCanvas();
            }
        }
    }, [isPlaneMode]);

    return (
        <div className="flex flex-col p-2 gap-2 h-[100vh]">
            <title>{findValue('BoringPreviewer', 'windowtitle')} - {boringName}</title>
            <div className="flex flex-row">
                <div className="flex-grow">
                    시추공 이름 : {boringName}
                </div>
                <div>
                    <ButtonPositive text={isPlaneMode ? '3D 보기' : '평면 보기'} onClickHandler={toggleMode} width={72} isEnabled={true} />
                </div>
            </div>
            {/* 두 개의 캔버스를 상태에 따라 번갈아가면서 보여주기 */}
            <div className="w-full h-full relative" style={{ backgroundColor: 'blue', overflow: 'hidden' }}>
                {/* 2D 캔버스: isPlaneMode가 true일 때 보여줌 */}
                <canvas
                    ref={canvas2dRef}
                    style={{ display: isPlaneMode ? 'block' : 'none', width: '100%', height: '100%' }}
                />
                
                {/* 3D 캔버스: isPlaneMode가 false일 때 보여줌 */}
                <canvas
                    ref={canvas3dRef}
                    style={{ display: isPlaneMode ? 'none' : 'block', width: '100%', height: '100%' }}
                />
            </div>
        </div>
    );
};