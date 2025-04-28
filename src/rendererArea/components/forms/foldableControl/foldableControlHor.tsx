import { ReactNode, useState } from "react";
import './foldableControlHorStyle.css';

interface FoldableControlHorProps {
    header: string,
    controls: ReactNode[];
}

export const FoldableControlHor:React.FC<FoldableControlHorProps> = ({header, controls = []}) => {    
    const [isFolded, setFolded] = useState<boolean>(true);

    const onClickHandler = () => {
        setFolded(!isFolded);
    }

    return (
        <div className="flex flex-row drop-shadow-md p-2 gap-2 self-center" style={{borderRadius: 8, background: 'white', borderWidth: 1, userSelect: 'none'}}>
            {isFolded && <div className="flex flex-row flex-grow min-w-2 gap-2">{controls}</div>}
            <button onClick={onClickHandler} className="button-toggle w-[24px] h-[24px]">
                {isFolded ? '>' : '<'}
            </button>
            <div>
                {header}
            </div>
        </div>
    )
}
