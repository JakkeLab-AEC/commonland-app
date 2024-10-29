import React, { useEffect, useState } from "react";
import { ListBoxHeader } from "./listBoxHeader";
import { ListBoxItemColorPicker } from "./listBoxItemColorPicker";

interface ListBoxColorPickerProps {
    height: number;
    items: Map<string, {displayString: string, checked: boolean, colorIndex: number}>;
    header: string,
    maxLength?: number
    onClickHandler?: (id: string) => void,
    onCheckedHandler?: (id: string, checked: boolean, all?: boolean|null) => void,
    onChangeColorHandler?: (id: string, index: number) => void,
}

interface ConvertedItemProps {
    key: string, 
    value: string, 
    isChecked: boolean,
    colorIndex: number,
}

export const ListBoxColorPicker: React.FC<ListBoxColorPickerProps> = ({height, items, header = "Header", onClickHandler, onCheckedHandler, onChangeColorHandler, maxLength = 16}) => {
    const [convertedItems, setConvertedItems] = useState<ConvertedItemProps[]>([]);
    const [headerChecked, setHeaderChecked] = useState<boolean>(false);
    
    const convertItems = (items: Map<string, {displayString: string, checked: boolean, colorIndex: number}>) => {
        const newConvertedItems:ConvertedItemProps[] = []; 
        if(items && items.size > 0) {
            items.forEach((value, key) => {
                newConvertedItems.push({key: key, value: value.displayString, isChecked: value.checked, colorIndex: value.colorIndex});
            })
        }
        setConvertedItems(newConvertedItems);
    }

    const onCheckedWrapper = (id: string, checked: boolean) => {
        if(onCheckedHandler) onCheckedHandler(id, checked, null);
        if(convertedItems) convertedItems.find(r => r.key == id).isChecked = checked;
        if(headerChecked && !checked) {
            setHeaderChecked(false);
        }
    }

    const onClickWrapper = (id: string) => {
        if(onClickHandler) {
            onClickHandler(id);
        }
    }

    const listBoxStyle: React.CSSProperties = {
        borderTopWidth: 1, 
        borderTopColor: 'silver', 
        borderBottomWidth: 1, 
        borderBottomColor: 'silver', 
        height: height ? height : 300,
        userSelect:'none'
    }

    const onCheckHeaderHandler = (isChecked: boolean) => {
        const newConvertedItems = [...convertedItems];
        newConvertedItems.forEach(item => {
            item.isChecked = isChecked;
        });

        if(onCheckedHandler) onCheckedHandler('', true, isChecked);
        setConvertedItems(newConvertedItems);
        setHeaderChecked(isChecked);
    }

    useEffect(() => {
        convertItems(items);
        if(items.size == 0) {
            setHeaderChecked(false);
        }
    }, [items])

    return (
        <div className="flex flex-col h-full" style={listBoxStyle}>
            <div>
                <ListBoxHeader id={"header"} displayText={header} onCheckedHandler={onCheckHeaderHandler} checked={headerChecked}/>
            </div>
            <hr />
            <div className="h-full" style={{overflowY:'auto'}}>
                {convertedItems.map(item => {
                    return (
                        <ListBoxItemColorPicker 
                            id={item.key}
                            isChecked={item.isChecked}
                            displayText={item.value.length > maxLength ? `${item.value.substring(0, maxLength - 1)}...` : item.value}
                            onCheckedHandler={onCheckedWrapper}
                            onClickItemHandler={onClickWrapper}
                            onChangeColorIndex={onChangeColorHandler}
                            colorIndex={item.colorIndex} />)
                    })}
            </div>
        </div>
    )
}
