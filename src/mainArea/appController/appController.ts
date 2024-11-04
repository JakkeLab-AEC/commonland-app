import { Database } from "sqlite";
import { UIController } from "./uicontroller/uicontroller";
import { openDB, truncateDBSoft } from "./repositoryConfig";
import { BoringRepository } from "../repository/boringRepository";
import { TopoRepository } from "../repository/topoRepository";

type RepositoryTypes = 'Boring'|'LandInfo'|'Topo'

export class AppController {
    private static Instance: AppController;
    private db?:Database;
    
    private boringRepository?: BoringRepository;
    private topoRepotisotry?: TopoRepository;

    private constructor() {
        openDB().then((res) => {
            this.db = res;
            this.boringRepository = new BoringRepository(this.db);
            this.topoRepotisotry = new TopoRepository(this.db);
        });
    }

    public static InitiateAppController(){
        AppController.Instance = new AppController();
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