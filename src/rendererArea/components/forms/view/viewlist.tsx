import React, { useEffect, useState } from "react";
import './viewlist.css'
import ViewListItem from "./viewitem";
import { SceneController } from "../../../../rendererArea/api/three/SceneController";

export default function ViewList() {
    const [isDeleteMode, setDeleteMode] = useState<boolean>(false);
    const [label, setLabel] = useState<string>("삭제")

    const renameHandler = (index: number, name: string) => {
        
    }
    
    const saveCurrentView = async () => {
        const camera = SceneController.getInstance().getCamera();
        const cameraJSON = SceneController.serializeCamera(camera);
        const result = await window.electronThreeViewAPI.saveThreeView(cameraJSON);
        const updatedViews = [...views];
        if(result.result) {
            switch(result.appendedItem.viewType) {
                case 'OrthographicCamera':{
                    const addedView = ThreeOrthographicView.createFromJSON(result.appendedItem as ThreeOrthographicViewJSON);
                    updatedViews.push(addedView);
                    setViews(updatedViews);
                    break;
                }
                    
                case 'PerspectiveCamera': {
                    ThreePerspectiveView.createFromJSON(result.appendedItem as ThreePerspectiveViewJSON);
                    break;
                }
            }
        }
    }

    const deleteHandler = async () => {

    };

    const updateView = (index: number) => {
        const view = views[index];
        SceneController.getInstance().updateCameraFromView(view);
    };

    const toggleDeleteMode = () => {
        if(!isDeleteMode){
            setLabel("취소");
        } else {
            setLabel("삭제");
        }
        setDeleteMode(!isDeleteMode);
    }

    useEffect(() => {
        const loadAllViews = async () => {
            const loadedViews = await window.electronThreeViewAPI.getAllViews();
            if(loadedViews.result && loadedViews.items) {
                const views = loadedViews.items.map((loadedView) => {
                    if(loadedView.viewType === 'OrthographicCamera') {
                        return ThreeOrthographicView.createFromJSON(loadedView as ThreeOrthographicViewJSON)
                    } else if (loadedView.viewType === 'PerspectiveCamera') {
                        return ThreePerspectiveView.createFromJSON(loadedView as ThreePerspectiveViewJSON);
                    }
                })
                setViews(views);
            }
        };

        loadAllViews();
        
    }, [])

    return (
        <div>
            <div className="place-content-between flex flex-row">
                <ButtonPositive text={"저장"} width={40} onClickHandler={saveCurrentView}/>
                <ButtonNegative text={label} width={40} onClickHandler={toggleDeleteMode}/>
            </div>
            <div id="scrollable-container" className="flex flex-wrap overflow-y-auto mt-2" style={{height: 600}}>
                {views.map((view, index) => (
                <ViewListItem
                    key={view.id.getValue()}
                    index={index}
                    text={view.viewName}
                    deleteMode={isDeleteMode}
                    renameHandler={renameHandler}
                    deleteHandler={deleteHandler}
                    onClickToChangeView={updateView}
                />
                ))}
            </div>
        </div>
        
    )
}