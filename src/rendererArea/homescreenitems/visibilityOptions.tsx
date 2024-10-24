import { ChangeEvent } from "react"
import { FoldableControlHor } from "../components/foldableControl/foldableControlHor"

export const VisibilityOptions = () => {

    const onChangePostOpacity = (e: ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.value);
    }

    const onChangeTopoOpacity = (e: ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.value);
    }

    const PostOpacitySlider = () => {
        return (
            <div className="flex flex-row gap-1">
                <div>
                    시추공 투명도
                </div>
                <input 
                    type='range'
                    className="w-[72px]"
                    onChange={onChangePostOpacity}/>
            </div>
        )
    }

    const TopoOpacitySlider = () => {
        return (
            <div className="flex flex-row gap-1">
                <div>
                    지형 투명도
                </div>
                <input 
                    type='range'
                    className="w-[72px]"
                    onChange={onChangeTopoOpacity}/>
            </div>
        )
    }

    return (
        <>
            <FoldableControlHor header={"표시 설정"} controls={[
                <PostOpacitySlider/>,
                <TopoOpacitySlider/>
            ]} />
        </>
    )
}
