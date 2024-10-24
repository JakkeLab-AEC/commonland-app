import React, { useEffect, useState } from "react";
import { ListBoxItem } from "./listBoxItem";
import { ListBoxHeader } from "./listBoxHeader";

interface ListBoxProps {
    height: number;
    items: Map<string, {displayString: string, checked: boolean}>;
    header: string,
    maxLength?: number
    onClickHandler?: (id: string) => void,
    onCheckedHandler?: (id: string, checked: boolean, all?: boolean) => void,
}

interface ConvertedItemProps {
    key: string, 
    value: string, 
    isChecked: boolean
}

export const ListBox: React.FC<ListBoxProps> = ({height, items, header = "Header", onClickHandler, onCheckedHandler, maxLength = 16}) => {
    const [convertedItems, setConvertedItems] = useState<ConvertedItemProps[]>([]);
    const [headerChecked, setHeaderChecked] = useState<boolean>(false);
    
    const convertItems = (items: Map<string, {displayString: string, checked: boolean}>) => {
        const newConvertedItems:ConvertedItemProps[] = []; 
        if(items && items.size > 0) {
            items.forEach((value, key) => {
                newConvertedItems.push({key: key, value: value.displayString, isChecked: value.checked});
            })
        }
        setConvertedItems(newConvertedItems);
    }

    const onCheckedWrapper = (id: string, checked: boolean) => {
        onCheckedHandler(id, checked, null);
        convertedItems.find(r => r.key == id).isChecked = checked;
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
        onCheckedHandler('', true, isChecked);
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
                        <ListBoxItem 
                            id={item.key}
                            isChecked={item.isChecked}
                            displayText={item.value.length > maxLength ? `${item.value.substring(0, maxLength - 1)}...` : item.value} 
                            onCheckedHandler={onCheckedWrapper} 
                            onClickItemHandler={onClickWrapper} />)
                    })}
            </div>
        </div>
    )
}
