import { Database } from "sqlite";
import { UIController } from "./uicontroller/uicontroller";
import { openDB, truncateDBSoft } from "./repositoryConfig";
import { BoringRepository } from "../repository/boringRepository";
import { TopoRepository } from "../repository/topoRepository";
import { PythonBridge } from "./bridge/pythonBridge";
import path from 'path';

type RepositoryTypes = 'Boring'|'LandInfo'|'Topo'

export class AppController {
    private static Instance: AppController;
    private db?:Database;
    
    private boringRepository?: BoringRepository;
    private topoRepotisotry?: TopoRepository;
    readonly pythonBridge: PythonBridge;
    readonly osInfo: 'win'|'mac';
    readonly appRootPath: string;

    private constructor(osInfo: "win"|"mac" = "win", pythonPath: string, appRootPath: string) {
        openDB().then((res) => {
            this.db = res;
            this.boringRepository = new BoringRepository(this.db);
            this.topoRepotisotry = new TopoRepository(this.db);
        });
        this.osInfo = osInfo;

        this.appRootPath = appRootPath;
        this.pythonBridge = new PythonBridge(pythonPath, osInfo, appRootPath);
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

    async truncateDBSoft() {
        if(this.db)
            await truncateDBSoft(this.db);
    }
}