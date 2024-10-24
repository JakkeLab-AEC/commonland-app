import React from "react"

interface ListBoxItemProps {
    id: string,
    displayText: string;
    isChecked?: boolean
    onCheckedHandler?: (id: string, isChecked: boolean) => void;
    onClickItemHandler?: (id: string) => void;
}

export const ListBoxItem:React.FC<ListBoxItemProps> = ({id, displayText, isChecked = false, onCheckedHandler, onClickItemHandler}) => {

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
    
    return (
        <div className="flex flex-row gap-2 h-[32px] items-center" key={id}>
            <div>
                <input 
                    type='checkbox'
                    onChange={onChekcedWrapper}
                    checked={isChecked}/>
            </div>
            <div className="" onClick={onClickWrapper} style={{cursor: 'pointer'}}>
                {displayText}
            </div>
        </div>
    )
}
