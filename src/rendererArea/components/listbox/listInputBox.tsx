import { ColorSquare } from "../palette/colorIndexPalette";

interface ListInputBoxProps {
    items: {name: string, index: number}[];
    width: number|'full';
    height: number|'full';
    onClickHandler: (id: string, index: number) => void;
}

export const ListInputBox:React.FC<ListInputBoxProps> = ({items, width, height, onClickHandler}) => {
    const listItems = items.map(item => {return (<ListInputBoxItem displayString={item.name} index={item.index} onClickHandler={onClickHandler} />)});
    
    return (
        <div className="flex flex-col gap-2" style={{width: width, height: height}}>
            <hr/>
            <div style={{overflowY: 'auto', overflowX:'hidden'}} className="p-1 flex-grow">
                {listItems}
            </div>
            <hr/>
        </div>
    )
}

interface ListInputBoxItem {
    displayString: string,
    index: number;
    onClickHandler: (id: string, index: number) => void;
}

const ListInputBoxItem:React.FC<ListInputBoxItem> = ({displayString, index, onClickHandler}) => {    
    const onClickWrapper = (index: number) => {
        onClickHandler(displayString, index);
    }
    
    return (
        <div className="flex flex-row h-[32px] self-center">
            <div className="flex-grow">
                {displayString}
            </div>
            <div>
                <ColorSquare index={index} onClickHandler={onClickWrapper} tooltipEnabled={false} />
            </div>
        </div>
    )
}