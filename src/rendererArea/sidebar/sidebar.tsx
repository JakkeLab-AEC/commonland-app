import './sidebarstyle.css';
import Button from "./iconButton";
import { TestPage } from "./pages/testPage";
import { BoringManager } from "./pages/editor/EditorPage";
import { useLanguageStore } from "../language/languageStore";
import { BoringBatcher } from "./pages/batchBorings/boringBatchers";
import { useSidebarStore } from "./sidebarStore";
import { useEffect, useState } from 'react';
import { useHomeStore } from '../commonStatus/homeStatusModel';
import { TopographyManage } from './pages/topography/topographyManage';

export default function Sidebar() {
    const {
        findValue,
    } = useLanguageStore();

    const {
        currentHomeId,
    } = useHomeStore();

    const [homeId, setHomeId] = useState<string>(currentHomeId);
    
    const {
        navigationIndex,
        setNaviationIndex
    } = useSidebarStore();

    const navigateMenu = (index: number) => {
        setNaviationIndex(index);
    };

    const menuNavigations: Array<{menuName:string, menuPage: JSX.Element, displayHeader: string, menuClickHandler: (index: number) => void}> = [{
            menuName: "Editor", 
            menuPage: (<BoringManager />), 
            displayHeader: findValue('BoringManager', 'pageHeader'),
            menuClickHandler: navigateMenu
        }, {
            menuName: "Batcher", 
            menuPage: (<BoringBatcher />), 
            displayHeader: '시추공 배치',
            menuClickHandler: navigateMenu
        }, {
            menuName: "Topo",
            menuPage: (<TopographyManage />),
            displayHeader: '지형 관리',
            menuClickHandler: navigateMenu
        }, {
            menuName: "TEST", 
            menuPage: (<TestPage />), 
            displayHeader: 'Test',
            menuClickHandler: navigateMenu
        }
    ];

    useEffect(() => {
        setHomeId(homeId);
    },[currentHomeId])
    
    return (
        <div className="w-[334px] h-full flex flex-row" style={{borderWidth: 1, borderColor: 'silver', borderTopRightRadius: 8, borderBottomRightRadius: 8}}>
            <div className="h-full w-12 flex flex-col" style={{backgroundColor: "#ECECEC"}}>
                {menuNavigations.map((item, index) => {
                    const isEnabled = index == navigationIndex ? true : false;
                    if(item.menuName != null || item.menuName == '' && item.menuPage != null || item.menuClickHandler != null)
                        return <Button key={index} menuName={item.menuName} isEnabled={isEnabled} navigateHandler={item.menuClickHandler} index={index}/>
                })}
            </div>
            <div className="flex-grow flex flex-col gap-1 pb-8" style={{backgroundColor: 'white', borderTopRightRadius: 8, borderBottomRightRadius: 8, padding: 8}}>
                <div style={{fontWeight: 700, fontSize: 20}}>
                    {menuNavigations[navigationIndex].displayHeader}
                </div>
                <hr style={{borderBottomWidth: 0.25, borderColor: 'silver'}}/>
                <div className="mt-1 h-full overflow-y-auto sidebar-area">
                    {/* Menu Page */}
                    {menuNavigations[navigationIndex].menuPage}
                </div>
            </div>
        </div>
    )
}