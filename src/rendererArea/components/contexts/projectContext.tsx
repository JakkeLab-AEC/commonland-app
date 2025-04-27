import { createContext, useContext, useEffect, useState } from "react";

interface ProjectContextType {
    projectName: string | undefined;
    epsgCode: number | undefined;
    setProjectInfo: (name?: string, epsg?: number) => void;
    fetchProjectInfo: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [projectName, setProjectName] = useState<string | undefined>('');
    const [epsgCode, setEpsgCode] = useState<number | undefined>(0);

    const setProjectInfo = (name?: string, epsg?: number) => {
        setProjectName(name);
        setEpsgCode(epsg);
    };

    const fetchProjectInfo = async () => {
        const fetchJob = await window.electronLandInfoAPI.fetchLandInfo();
        if (fetchJob?.result && fetchJob.landInfo) {
            setProjectName(fetchJob.landInfo.name);
            setEpsgCode(fetchJob.landInfo.epsg);
        }
    };

    useEffect(() => {
        fetchProjectInfo(); // 컴포넌트 마운트 시 초기 데이터 로딩
    }, []);

    return (
        <ProjectContext.Provider value={{ projectName, epsgCode, setProjectInfo, fetchProjectInfo }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProjectContext = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProjectContext must be used within a ProjectProvider');
    }
    return context;
};