import ServiceLogo from "./logo/servicelogo";
import { ButtonPositive } from "../buttons/buttonPositive";
import { useEffect, useState } from "react";
import { ContextMenu, ContextMenuProp } from "../contextmenu/contextMenu";
import './headerStyle.css';
import { useModalOveralyStore } from "@/rendererArea/homescreenitems/modalOverlayStore";
import {ModalDxfExporter} from './exporter/modalDxfExporter';
import { SceneController } from "@/rendererArea/api/three/SceneController";
import { InspectorHeadless } from "../inspector/inspectorHeadless";
import { useModalOveralyUtils } from "@/rendererArea/homescreenitems/modalOverlayUtils";
import { useHomeStore } from "@/rendererArea/commonStatus/homeStatusModel";
import { useSidebarStore } from "@/rendererArea/sidebar/sidebarStore";
import { ProgressBar } from "../progressbar/progressbar";
import { useProjectContext } from "../../contexts/projectContext";
import { useProjectPageStore } from "@/rendererArea/sidebar/pages/project/projectPageStore";
import { ModalLoading } from "../loadings/modalLoading";


export const ModalLoadingProject:React.FC = () => {
    const progress = useModalOveralyStore((state) => state.progress);

    return (
        <InspectorHeadless width={160} height={120}>
            <div className="flex flex-col items-center h-full p-2">
                <div className="flex h-full self-center">
                    프로젝트 로드 중
                </div>
                <ProgressBar value={progress} />
            </div>
        </InspectorHeadless>
    )
}


export default function Header({appName}:{appName: string}) {
    const { withModalOverlay } = useModalOveralyUtils();
    const [menuVisibility, setMenuVisibility] = useState<boolean>(false);
    const {
        updateHomeId,
        osName
    } = useHomeStore();

    const {
        fetchLandInfo
    } = useProjectPageStore();

    const {
        toggleMode,
        updateModalContent,
        updateProgress,
    } = useModalOveralyStore();

    const {
        navigationIndex,
        setNaviationIndex
    } = useSidebarStore();
    
    const contextMenuProp:ContextMenuProp = {
        menuItemProps: [{
            displayString: '새 프로젝트 생성',
            isActionIdBased: false,
            action: async () => {
                const job = await window.electronProjectIOAPI.newProject();
                if(job.result && job.landInfo) {
                    await fetchLandInfo();
                }

                SceneController.getInstance().getViewportControl().resetCamera(true);
            },
            closeHandler: () => setMenuVisibility(false),
        }, {
            displayString: '프로젝트 파일 저장',
            isActionIdBased: false,
            action: async () => await window.electronProjectIOAPI.saveProject(),
            closeHandler: () => setMenuVisibility(false),
        }, {
            displayString: '프로젝트 파일 불러오기',
            isActionIdBased: false,
            action: async () => {
                await withModalOverlay('loading', async () => {
                    const loadProject = await window.electronProjectIOAPI.openProject();

                    const callback = () => {
                        SceneController.getInstance().getViewportControl().resetCamera();
                        toggleMode(false);
                    }
                    if(loadProject.result) {
                        updateModalContent(<ModalLoading />)
                        updateHomeId();
                        toggleMode(true);
                        setNaviationIndex(navigationIndex == 1 ? 0 : 1);
                        await SceneController
                            .getInstance()
                            .getDataMangeService()
                            .refreshAllGeometries(callback);
                    }
                })
            },
            closeHandler: () => setMenuVisibility(false),
        }, {
            displayString: '시추공 DXF 내보내기',
            isActionIdBased: false,
            action: async () => {
                updateModalContent(<ModalDxfExporter mode={"boring"} />);
                toggleMode(true);
            },
            closeHandler: () => setMenuVisibility(false),
        }, {
            displayString: '지형 DXF 내보내기',
            isActionIdBased: false,
            action: async () => {
                updateModalContent(<ModalDxfExporter mode={"topo"} />);
                toggleMode(true);
            },
            closeHandler: () => setMenuVisibility(false),
        }],
        width: 180,
        onClose: () => setMenuVisibility(false)
    }

    useEffect(() => {
        
    }, []);

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