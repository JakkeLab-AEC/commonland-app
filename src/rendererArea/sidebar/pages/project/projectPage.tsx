import React, { useEffect, useRef } from "react"
import { ButtonPositive } from "@/rendererArea/components/buttons/buttonPositive"
import { ButtonNegative } from "@/rendererArea/components/buttons/buttonNegative"
import { useProjectPageStore } from "./projectPageStore";
import { LandInfoModifyOption } from "@/mainArea/repository/landInfoRepository";

export const Project:React.FC = () => {
    const projectNameRef = useRef<HTMLInputElement>();
    const epsgRef = useRef<HTMLInputElement>();
    const {
        projectName,
        epsgCode,
        updateLandinfo,
        fetchLandInfo,
    } = useProjectPageStore();

    const updateInfo = () => {
        const updatedProjectName = projectNameRef.current.value;
        const updatedEPSG = parseInt(epsgRef.current.value);

        const option: LandInfoModifyOption = {
            name: updatedProjectName,
            epsg: updatedEPSG
        };

        updateLandinfo(option);
    }
    
    const cancelUpdate = () => {
        projectNameRef.current.value = projectName;
        epsgRef.current.value = epsgCode.toString();
    }

    useEffect(() => {
        if (projectNameRef.current) {
            projectNameRef.current.value = projectName || '';
        }
        if (epsgRef.current) {
            epsgRef.current.value = epsgCode?.toString() || '0';
        }
    }, [projectName, epsgCode]);
    
    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-row w-full gap-2">
                <span>프로젝트명</span>
                <input 
                    className="border rounded-md flex flex-grow" 
                    defaultValue={projectName}
                    ref={projectNameRef}/>
            </div>
            <div className="flex flex-row w-full gap-2">
                <span>EPSG</span>
                <input 
                    className="border rounded-md flex ml-auto w-[80px]" 
                    type="number" 
                    defaultValue={epsgCode}
                    step={1}
                    ref={epsgRef}/>
            </div>
            <hr/>
            <div className="flex flex-row gap-2 ml-auto">
                <ButtonPositive text={"저장"} isEnabled={true} width={48} onClickHandler={updateInfo}/>
                <ButtonNegative text={"취소"} isEnabled={true} width={48} onClickHandler={cancelUpdate}/>
            </div>
        </div>
    )
}
