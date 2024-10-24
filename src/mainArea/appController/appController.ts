import { Database } from "sqlite";
import { UIController } from "./uicontroller/uicontroller";
import { openDB, truncateDBSoft } from "./repositoryConfig";
import { BoringRepository } from "../repository/boringRepository";

type RepositoryTypes = 'Boring'|'LandInfo'|'Topo'

export class AppController {
    private static Instance: AppController;
    private db?:Database;
    private uiController: UIController;

    private boringRepository?: BoringRepository;

    private constructor() {
        openDB().then((res) => {
            this.db = res;
            this.boringRepository = new BoringRepository(this.db);
        });
        
        this.uiController = new UIController();
    }

    public static InitiateAppController(){
        AppController.Instance = new AppController();
    }

    public static getInstance(){
        return AppController.Instance;
    }

    getRepository(type: RepositoryTypes) {
        switch(type) {
            case 'Boring': {
                return this.boringRepository;
            }
        }
    }

    async truncateDBSoft() {
        if(this.db)
            await truncateDBSoft(this.db);
    }
}