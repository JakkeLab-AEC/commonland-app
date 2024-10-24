import React from "react"
import {ButtonPositive} from '../../../../../components/buttons/buttonPositive';

interface LayerSetHeaderProps {
    onCreate: () => void;
}

export const LayerSetHeader:React.FC<LayerSetHeaderProps> = ({onCreate}) => {
    return (
        <div className="flex flex-row h-[32px] items-center">
            <div className="w-[32px]">

            </div>
            <div className="flex w-[80px]">
                지층명
            </div>
            <div className="flex-grow">
                층후
            </div>
            <div>
                <ButtonPositive text={"추가"} width={48} isEnabled={true} onClickHandler={onCreate}/>
            </div>
        </div>
    )
}
