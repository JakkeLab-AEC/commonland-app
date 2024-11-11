import ServiceLogo from "./logo/servicelogo";
import { ButtonPositive } from "../buttons/buttonPositive";
import { useState } from "react";
import { ContextMenu, ContextMenuProp } from "../contextmenu/contextMenu";
import { useHomeStore } from "../../commonStatus/homeStatusModel";
import { useSidebarStore } from "../../../rendererArea/sidebar/sidebarStore";
import { ThreeExporter } from "@/rendererArea/api/three/exporters/threeExporter";
import './headerStyle.css';

export default function Header({appName}:{appName: string}) {
    const [menuVisibility, setMenuVisibility] = useState<boolean>(false);
    const {
        updateHomeId,
        osName
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
        }, {
            displayString: '파일 불러오기',
            isActionIdBased: false,
            action: async () => {
                await window.electronProjectIOAPI.openProject();
                updateHomeId();
                setNaviationIndex(navigationIndex == 1 ? 0 : 1);
            },
            closeHandler: () => setMenuVisibility(false),
        }, {
            displayString: '시추공 DXF 내보내기',
            isActionIdBased: false,
            action: async () => {
                ThreeExporter.exportBoringsDXF('KOR');
            },
            closeHandler: () => setMenuVisibility(false),
        }, {
            displayString: '지형 DXF 내보내기',
            isActionIdBased: false,
            action: async () => {
                ThreeExporter.exportToposDXF();
            },
            closeHandler: () => setMenuVisibility(false),
        },
        ],
        width: 180,
        onClose: () => setMenuVisibility(false)
    }

    return (
        <div className={`w-full flex key-color-main h-[48px] items-center ${osName == 'win32' ? 'pl-4' : 'pl-20'} pr-4`} style={{borderBottomWidth: 2, borderColor: "silver", userSelect: 'none'}}>
            <div className="main-header flex-grow">
                <ServiceLogo appName={appName} />
            </div>
            <div className={osName == 'win32' ? `mr-[20px]` : `mr-[120px]`}>
                <ButtonPositive text={"메뉴"} width={80} isEnabled={true} onClickHandler={() => setMenuVisibility(true)}/>
            </div>
            { menuVisibility && 
            <div style={{position: 'absolute', right: 220, top: 40}}>
                <ContextMenu 
                    menuItemProps = {contextMenuProp.menuItemProps} 
                    width={contextMenuProp.width} 
                    onClose={contextMenuProp.onClose} />
            </div>}
            {osName == 'win32' && 
            <div className="flex flex-row gap-4">
            {/* Minimize Button */}
            <button onClick={() => {window.electronWindowControlAPI.minimize()}} className="menu-btn-neutral">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke='black'>
                    <line x1="3" y1="7" x2="13" y2="7" strokeWidth="1"/>
                </svg>
            </button>

            {/* Maximize/Restore Button */}
            {/* ipcRenderer.send('window-control', 'maximize') */}
            <button onClick={() => {window.electronWindowControlAPI.maximize()}} className="menu-btn-neutral">
                <svg width="16" height="16" viewBox="0 0 16 16"  fill="none" stroke="black">
                    <rect x="3" y="3" width="10" height="10" strokeWidth={1}/>
                </svg>
            </button>
            {/* Close Button */}
            {/* ipcRenderer.send('window-control', 'close') */}
            <button onClick={() => {window.electronWindowControlAPI.quit()}} className="menu-btn-negative">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="black">
                    <line x1="3" y1="3" x2="13" y2="13" strokeWidth="1"/>
                    <line x1="3" y1="13" x2="13" y2="3" strokeWidth="1"/>
                </svg>
            </button>
            </div>}
        </div>
    )
}