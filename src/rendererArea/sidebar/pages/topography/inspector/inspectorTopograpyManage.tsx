import React, { useEffect, useState } from "react"
import {LayerSelector} from '../components/layerSelector';
import {D3LineChart} from '../../../../api/d3chart/d3linechart';
import { ButtonPositive } from "@/rendererArea/components/buttons/buttonPositive";
import { ButtonNegative } from "@/rendererArea/components/buttons/buttonNegative";
import { useModalOveralyStore } from "@/rendererArea/homescreenitems/modalOverlayStore";

export const InspectorTopographyManager:React.FC = () => {
    const {
        toggleMode,
    } = useModalOveralyStore();

    const onSubmit = (layer: { layerId: string, layerName: string | undefined }) => {
        console.log("Selected layer:", layer);
    };
    
    // Function to generate sample data for borings
    const generateSampleBoringData = (count: number) => {
        return Array.from({ length: count }, (_, index) => ({
            name: `BH-0${index + 1}`,
            id: `BH-0${index + 1}-id${index + 1}`,
            layers: [
                { layerId: `layer${index + 1}-1`, layerName: `Layer${index + 1}-1`, level: 10.55 },
                { layerId: `layer${index + 1}-2`, layerName: `Layer${index + 1}-2`, level: 8.7 },
                { layerId: `layer${index + 1}-3`, layerName: `Layer${index + 1}-3`, level: 6.5 },
                { layerId: `layer${index + 1}-4`, layerName: `Layer${index + 1}-4`, level: 2.2 },
                { layerId: `layer${index + 1}-5`, layerName: `Layer${index + 1}-5`, level: 2.2 },
                { layerId: `layer${index + 1}-6`, layerName: `Layer${index + 1}-6`, level: 2.2 },
                { layerId: `layer${index + 1}-6`, layerName: `Layer${index + 1}-6`, level: 2.2 },
                { layerId: `layer${index + 1}-6`, layerName: `Layer${index + 1}-6`, level: 2.2 },
            ],
        }));
    };

    // Generate 4 sample boring data entries
    const sampleBoringData = generateSampleBoringData(50);

    const [data, setData] = useState([
        { name: "A", value: 30 },
        { name: "B", value: 80 },
        { name: "C", value: 45 },
        { name: "D", value: 60 },
        { name: "E", value: 20 },
    ]);
    
    const updateData = () => {
        setData(data.map((d) => ({ ...d, value: Math.random() * 100 })));
    };

    const generateSampleData = (count: number) => {
        return Array.from({ length: count }, (_, index) => ({
            name: `B-${index + 1}`,
            value: Math.floor(Math.random() * 100) * 0.8
        }));
    };
    
    useEffect(() => {
        const generatedData = generateSampleData(50);
        setData(generatedData);
    }, []);

    return (
        <div className="flex flex-col h-full">
            {/* Layer selector */}
            <div className="m-2">높이 지정</div>
            <div className="flex flex-row gap-1 border ml-2 mr-2 mb-2 p-2" style={{overflowX: 'auto'}}>
                {sampleBoringData.map((boring) => (
                    <LayerSelector
                        key={boring.id}
                        boringName={boring.name}
                        boringId={boring.id}
                        layerValues={boring.layers}
                        onSubmit={onSubmit}
                    />
                ))}
            </div>
            <hr />
            {/* Chart */}
            <div className="m-2">미리보기</div>
            <div className="flex-grow">
                <D3LineChart data={data} />
            </div>
            <hr className="mt-auto"/>
            <div className="flex self-end gap-1 p-2 h-[36px]">
                <ButtonPositive text={"생성"} isEnabled={true} width={48} />
                <ButtonNegative text={"취소"} isEnabled={true} width={48} onClickHandler={() => toggleMode(false)} />
            </div>
        </div>
    );
}
