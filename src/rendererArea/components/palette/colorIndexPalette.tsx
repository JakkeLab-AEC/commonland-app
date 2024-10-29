import { colorPaletteValues } from "../../../public/colorPalette"
import './colorIndexPaletteStyle.css';

interface ColorSquareProp {
    index: number,
    tooltipEnabled: boolean
    onClickHandler: (index: number) => void;
}

export const ColorSquare: React.FC<ColorSquareProp> = ({ index, tooltipEnabled = true, onClickHandler }) => {
    const paletteStyle: React.CSSProperties = {
        width: 16,
        height: 16,
        cursor: 'pointer',
        borderWidth: 1,
        borderColor: 'silver',
        backgroundColor: colorPaletteValues[index],
        position: 'relative', // Ensure relative positioning for the tooltip
    };

    const onClickWrapper = () => {
        onClickHandler(index);
    };

    return (
        <div className={tooltipEnabled ? "color-square" : '' } style={paletteStyle} onClick={onClickWrapper}>
            <span className="palette-color-tooltip">{index}</span>
        </div>
    );
};

interface ColorIndexPaletteProps {
    width: number|'full',
    height: number|'full',
    headerName?: string,
    onClickHandler: (index: number) => void,
}

export const ColorIndexPalette:React.FC<ColorIndexPaletteProps> = ({width, height, headerName = null, onClickHandler}) => {
    const colorSquares: React.JSX.Element[] = [];
    for(let i = 1; i <= 255; i++) {
        const colorItem = <ColorSquare index={i} onClickHandler={onClickHandler} tooltipEnabled={true} />;
        colorSquares.push(colorItem);
    }

    return (
        <div className="flex flex-col gap-2">
            {headerName}
            <div className="flex flex-wrap gap-1 border p-2" style={{width: width, height: height, backgroundColor: 'white', overflowY: 'auto', position: 'relative'}}>
                {colorSquares}
            </div>
        </div>
    )
}
