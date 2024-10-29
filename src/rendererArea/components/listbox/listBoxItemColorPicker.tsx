import React, { useState } from "react"
import {ColorSquare, ColorIndexPalette} from '../../components/palette/colorIndexPalette';
import {Inspector} from '../../components/inspector/inspector';

interface ListBoxItemProps {
    id: string,
    displayText: string;
    colorIndex: number;
    isChecked?: boolean
    onCheckedHandler?: (id: string, isChecked: boolean) => void;
    onClickItemHandler?: (id: string) => void;
    onChangeColorIndex?: (id: string, index: number) => void;
}

export const ListBoxItemColorPicker:React.FC<ListBoxItemProps> = ({id, displayText, colorIndex, isChecked = false, onCheckedHandler, onClickItemHandler, onChangeColorIndex}) => {
    const [isPaletteOpened, setPaletteState] = useState<boolean>(false);

    const onChekcedWrapper = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(onCheckedHandler) {
            onCheckedHandler(id, e.target.checked);
        }
    }

    const onClickWrapper = (e: React.MouseEvent<HTMLDivElement>) => {
        if(onClickItemHandler) {
            onClickItemHandler(id);
        }
    }

    const onClickShowColorPicker = () => {
        setPaletteState(true);
    }

    const onClickSelectColor = (index: number) => {
        if(onChangeColorIndex) {
            onChangeColorIndex(id, index);
        }
        setPaletteState(false);
    }
    
    return (
        <div className="flex flex-row gap-2 h-[32px] items-center" key={id}>
            <div>
                <input 
                    type='checkbox'
                    onChange={onChekcedWrapper}
                    checked={isChecked}/>
            </div>
            <div className="flex-grow" onClick={onClickWrapper} style={{cursor: 'pointer'}}>
                {displayText}
            </div>
            <div className="mr-2">
                <ColorSquare index={colorIndex} tooltipEnabled={false} onClickHandler={onClickShowColorPicker} />
                {isPaletteOpened && <div style={{position: 'absolute', left: 360, top: 20}}>
                    <Inspector title={"색상 선택"} width={240} height={260} onClickCloseHandler={() => setPaletteState(false)}>
                        <div className="self-center">
                            <ColorIndexPalette width={'full'} height={200} onClickHandler={onClickSelectColor} />
                        </div>
                    </Inspector>
                </div>}
            </div>
        </div>
    )
}
