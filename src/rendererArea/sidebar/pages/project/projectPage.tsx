import React, { useEffect, useRef, useState } from "react"
import { ButtonPositive } from "@/rendererArea/components/forms/buttons/buttonPositive"
import { ButtonNegative } from "@/rendererArea/components/forms/buttons/buttonNegative"
import { useProjectPageStore } from "./projectPageStore";
import { LandInfoModifyOption } from "@/mainArea/repository/landInfoRepository";
import { LandInfoDTO } from "@/dto/serviceModel/landInfo";

export const Project:React.FC = () => {
    const {
        updateLandinfo,
        fetchLandInfo,
        epsgCode,
        projectName
    } = useProjectPageStore();

    const projectNameRef = useRef<HTMLInputElement>();
    const epsgRef = useRef<HTMLInputElement>();

    const [projectNameProp, setProjectNameProp] = useState<string>();
    const [projectEPSGProp, setProjectEPSGProp] = useState<number>();

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
        fetchLandInfo((data: LandInfoDTO) => {
            setProjectNameProp(data.name);
            setProjectEPSGProp(data.epsg);
        });
    }, [projectName, epsgCode]);
    
    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-row w-full gap-2">
                <span>프로젝트명</span>
                <input 
                    className="border rounded-md flex flex-grow" 
                    value={projectNameProp}
                    onChange={(e) => setProjectNameProp(e.target.value)}
                    ref={projectNameRef}/>
            </div>
            <div className="flex flex-row w-full gap-2">
                <span>EPSG</span>
                <input 
                    className="border rounded-md flex ml-auto w-[80px]" 
                    type="number" 
                    value={projectEPSGProp}
                    step={1}
                    onChange={(e) => setProjectEPSGProp(parseInt(e.target.value))}
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
