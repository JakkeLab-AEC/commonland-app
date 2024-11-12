import React, { useEffect } from "react"
import {InspectorFixed} from '../../../../components/inspector/inspectorFixed';
import {ButtonPositive} from '../../../../components/buttons/buttonPositive';
import {ButtonNegative} from '../../../../components/buttons/buttonNegative';
import {useModalOveralyStore} from '../../../../homescreenitems/modalOverlayStore';

interface ModalSwapXYProps {
    onSelectMode: (result: boolean) => void;
}

export const ModalSwapXY:React.FC<ModalSwapXYProps> = ({onSelectMode}) => {
    const {
        toggleMode,
        resetProps
    } = useModalOveralyStore();

    const modalCloseWithAction = () => {
        onSelectMode(true);
        toggleMode(false);
    }

    const modalCloseNoAction = () => {
        onSelectMode(false);
        toggleMode(false);
    }

    useEffect(() => {
        return (() => {
            resetProps();
        })
    })

    return (
    <InspectorFixed title={"X, Y 좌표 변경"} width={280} height={160} onClickCloseHandler={modalCloseNoAction}>
        <div className="flex flex-col p-2 h-full">
            <div>
                전체 시추공의 X, Y 좌표를 변경하겠습니까?
            </div>
            <div className="mt-auto self-end flex gap-1">
                <ButtonPositive text={"확인"} isEnabled={true} onClickHandler={modalCloseWithAction} width={48} />
                <ButtonNegative text={"취소"} isEnabled={true} onClickHandler={modalCloseNoAction} width={48} />
            </div>
        </div>
    </InspectorFixed>
    )
}