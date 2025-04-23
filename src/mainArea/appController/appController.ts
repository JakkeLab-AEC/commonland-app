import { Database } from "sqlite";
import { flushData, openDB, truncateDBSoft } from "./repositoryConfig";
import { BoringRepository } from "../repository/boringRepository";
import { TopoRepository } from "../repository/topoRepository";
import { PythonBridge } from "./bridge/pythonBridge";
import { app } from "electron";
import { BoundaryRepository } from "../repository/boundaryRepository";

type RepositoryTypes = 'Boring'|'LandInfo'|'Topo'

export class AppController {
    private static Instance: AppController;
    private db?:Database;
    
    private boringRepository?: BoringRepository;
    private topoRepotisotry?: TopoRepository;
    private boundaryRepository?: BoundaryRepository;
    readonly pythonBridge: PythonBridge;
    readonly osInfo: 'win'|'mac';
    readonly appRootPath: string;

    private constructor(osInfo: "win"|"mac" = "win", pythonPath: string, appRootPath: string) {
        openDB().then((res) => {
            this.db = res;
            this.boringRepository = new BoringRepository(this.db);
            this.topoRepotisotry = new TopoRepository(this.db);
            this.boundaryRepository = new BoundaryRepository(this.db);
        });
        this.osInfo = osInfo;

        this.appRootPath = appRootPath;
        this.pythonBridge = new PythonBridge({
            embeddedPath: pythonPath, 
            platform: osInfo, 
            appRootPath: appRootPath, 
            appRuntimePath: app.getPath('userData')
        });
        this.pythonBridge.ready();
        console.log(`Python Directory : ${pythonPath}`);
    }

    public static InitiateAppController(osInfo: "win"|"mac" = "win", pythonPath: string, appRootPath: string){
        AppController.Instance = new AppController(osInfo, pythonPath, appRootPath);
    }

    public static getInstance(){
        return AppController.Instance;
    }

    getBoringRepository() {
        return this.boringRepository;
    }

    getTopoRepository() {
        return this.topoRepotisotry;
    }

    getBoundaryRepository() {
        return this.boundaryRepository;
    }

    async truncateDBSoft() {
        if(this.db)
            await truncateDBSoft(this.db);
    }

    async truncateDatas() {
        await flushData(this.db);
    }
}