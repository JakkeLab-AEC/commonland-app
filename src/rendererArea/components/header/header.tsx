import ServiceLogo from "./logo/servicelogo";
import { ButtonPositive } from "../buttons/buttonPositive";
import { useState } from "react";
import { ContextMenu, ContextMenuProp } from "../contextmenu/contextMenu";
import { useHomeStore } from "../../commonStatus/homeStatusModel";
import { useSidebarStore } from "../../../rendererArea/sidebar/sidebarStore";


export default function Header({appName}:{appName: string}) {
    const [menuVisibility, setMenuVisibility] = useState<boolean>(false);
    const {
        updateHomeId,
    } = useHomeStore();

    const {
        navigationIndex,
        setNaviationIndex
    } = useSidebarStore();
    
    const contextMenuProp:ContextMenuProp = {
        menuItemProps: [{
            displayString: '파일 저장',
            isActionIdBased: false,
            action: async () => await window.electronProjectIOAPI.saveProject(),
            closeHandler: () => setMenuVisibility(false),
        },{
            displayString: '파일 불러오기',
            isActionIdBased: false,
            action: async () => {
                await window.electronProjectIOAPI.openProject();
                updateHomeId();
                setNaviationIndex(navigationIndex == 1 ? 0 : 1);
            },
            closeHandler: () => setMenuVisibility(false),
        },
        ],
        width: 180,
        onClose: () => setMenuVisibility(false)
    }
    return (
        <div className="w-full flex key-color-main h-[48px] items-center pl-20 pr-4 " style={{borderBottomWidth: 2, borderColor: "silver"}}>
            <div className="main-header flex-grow">
                <ServiceLogo appName={appName} />
            </div>
            <div className="mr-[120px]">
                <ButtonPositive text={"메뉴"} width={80} isEnabled={true} onClickHandler={() => setMenuVisibility(true)}/>
            </div>
            { menuVisibility && 
            <div style={{position: 'absolute', right: 220, top: 40}}>
                <ContextMenu 
                    menuItemProps = {contextMenuProp.menuItemProps} 
                    width={contextMenuProp.width} 
                    onClose={contextMenuProp.onClose} />
            </div>}
        </div>
    )
}