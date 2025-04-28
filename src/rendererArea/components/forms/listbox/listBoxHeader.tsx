import React from "react"

interface ListBoxHeaderProps {
    id: string,
    displayText: string;
    checked: boolean;
    onCheckedHandler?: (isChecked: boolean) => void;
}

export const ListBoxHeader:React.FC<ListBoxHeaderProps> = ({id, displayText, checked, onCheckedHandler}) => {

    const onChekcedWrapper = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(onCheckedHandler) {
            onCheckedHandler(e.target.checked);
        }
    }
    
    return (
        <div className="flex flex-row gap-2 h-[32px] items-center" key={id}>
            <div>
                <input 
                    type='checkbox'
                    onChange={onChekcedWrapper}
                    checked={checked}/>
            </div>
            <div>
                {displayText}
            </div>
        </div>
    )
}
