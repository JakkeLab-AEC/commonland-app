import { ButtonPositive } from "../../../rendererArea/components/buttons/buttonPositive"
import { ColorIndexPalette } from "../../../rendererArea/components/palette/colorIndexPalette"
import { TestAPI } from "../../../rendererArea/api/test/testAPI"
import {MultilineTextbox} from '../../components/multilineTextbox/multilineTextBox';
import { ThreeExporter } from "@/rendererArea/api/three/exporters/threeExporter";

export const TestPage = () => {

    const testPosts = async () => {
        const testApi = new TestAPI();
        testApi.createTestBorings(30);
    }

    const testOnSelectColor = (index: number) => {
        console.log(index);
        const teststring = 'hello';
    }

    const testText = () => {
        
    }

    
    return (
        <div className="flex flex-col gap-2">
            <ButtonPositive text={"Create Test Borings"} isEnabled={true} onClickHandler={testPosts}/>
            <ButtonPositive text={"Text test"} isEnabled={true} onClickHandler={testText}/>
            <ColorIndexPalette width={'full'} height={120} onClickHandler={testOnSelectColor} headerName="Colors" />
            <MultilineTextbox height={240} width={160} maxCharsPerLine={8} />
        </div>
    )
}
