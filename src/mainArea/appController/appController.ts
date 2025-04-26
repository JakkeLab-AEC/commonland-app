import { Database } from "sqlite";
import { flushData, openDB, truncateDBSoft } from "./repositoryConfig";
import { BoringRepository } from "../repository/boringRepository";
import { TopoRepository } from "../repository/topoRepository";
import { PythonBridge } from "./bridge/pythonBridge";
import { app } from "electron";
import { BoundaryRepository } from "../repository/boundaryRepository";
import { LandInfoRepository } from "../repository/landInfoRepository";
import { DEFAULT_VALUES } from "@/public/defaultValues";
import { ElementId } from "../models/id";

interface Repositories {
    boundary: BoundaryRepository;
    landInfo: LandInfoRepository;
    topo: TopoRepository;
    boring: BoringRepository;
}

export class AppController {
    private static Instance: AppController;
    private db?:Database;
    
    private boringRepository?: BoringRepository;
    private topoRepotisotry?: TopoRepository;
    private boundaryRepository?: BoundaryRepository;
    private landInfoRepository?: LandInfoRepository;

    readonly pythonBridge: PythonBridge;
    readonly osInfo: 'win'|'mac';
    readonly appRootPath: string;

    private constructor(osInfo: "win"|"mac" = "win", pythonPath: string, appRootPath: string) {
        openDB().then(async (res) => {
            this.db = res;
            this.boringRepository = new BoringRepository(this.db);
            this.topoRepotisotry = new TopoRepository(this.db);
            this.boundaryRepository = new BoundaryRepository(this.db);
            this.landInfoRepository = new LandInfoRepository(this.db);

            await this.landInfoRepository.registerInfo(DEFAULT_VALUES.DEFAULT_LANDINFO, new ElementId().getValue());
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

    get repositories():Repositories {
        return {
            boundary: this.boundaryRepository,
            landInfo: this.landInfoRepository,
            topo: this.topoRepotisotry,
            boring: this.boringRepository
        }
    }

    async truncateDBSoft() {
        if(this.db)
            await truncateDBSoft(this.db);
    }

    async truncateDatas() {
        await flushData(this.db);
    }
}