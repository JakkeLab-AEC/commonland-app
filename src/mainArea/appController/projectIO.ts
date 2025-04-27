import { LandInfoDTO } from "@/dto/serviceModel/landInfo";
import { BoringDTO } from "../../dto/serviceModel/BoringDTO";
import { LayerColorConfig } from "../models/uimodels/layerColorConfig";
import { AppController } from "./appController";
import * as fs from 'fs/promises';
import { ProjectFileDTO } from "@/dto/projectFile";
import { LayerColor } from "@/dto/serviceModel/layerColor";
import { DEFAULT_VALUES } from "@/public/defaultValues";
import { ElementId } from "../models/id";
import { BoundaryDTO } from "@/dto/serviceModel/boundaryDto";

export class ProjectWrite {
    private landInfo: LandInfoDTO;
    private borings: BoringDTO[];
    private layerColors: {layerName: string, colorIndex: number}[];
    private filePath: string;
    private boundaries: BoundaryDTO[];

    private async writeLandInfo() {
        const fetchLandInfoJob = await AppController.getInstance().repositories.landInfo.fetchInfo();
        if(fetchLandInfoJob.result) {
            this.landInfo = fetchLandInfoJob.landInfo;
        }
    }

    private async writeBoringDatas() {
        this.borings = [];
        const fetchAllBoringJob = await AppController.getInstance().repositories.boring.fetchAllBorings();
        if(fetchAllBoringJob.result) {
            this.borings.push(...fetchAllBoringJob.fetchedBorings);
        }
    }

    private async writeLayerConfig() {
        this.layerColors = [];
        const fetchLayerConfigJob = await AppController.getInstance().repositories.boring.getAllLayerColors();
        if(fetchLayerConfigJob.result) {
            fetchLayerConfigJob.layerColors.forEach(ly => {
                this.layerColors.push({
                    layerName: ly[0],
                    colorIndex: ly[1]
                });
            })
        }
    }

    private async writeBoundaryDatas() {
        this.boundaries = [];
        const fetchBoundaryJob = await AppController.getInstance().repositories.boundary.selectAllBoundaries();
        if(fetchBoundaryJob.result) {
            fetchBoundaryJob.boundaries.forEach(b => {
                this.boundaries.push(...fetchBoundaryJob.boundaries);
            })
        }
    }

    async createSaveFile() {
        // Write data
        await this.writeLandInfo();
        await this.writeBoringDatas();
        await this.writeLayerConfig();
        await this.writeBoundaryDatas();

        // Create JSON data
        const dataToSave: ProjectFileDTO = {
            landInfo: this.landInfo,
            borings: this.borings,
            layerColors: this.layerColors,
            boundaries: this.boundaries,
        };

        // Convert to JSON strings
        const jsonString = JSON.stringify(dataToSave, null, 2); // Indent setting

        try {
            // 파일로 저장
            await fs.writeFile(this.filePath, jsonString, 'utf-8');
            console.log(`File saved successfully at ${this.filePath}`);
        } catch (error) {
            console.error('Error saving the file:', error);
        }
    }

    setFilePath(path: string) {
        this.filePath = path;
    }

    constructor() {
        this.borings = [];
        this.layerColors = [];
    }
}

export class ProjectRead {
    private landInfo: LandInfoDTO;
    private borings: BoringDTO[];
    private layerColors: LayerColor[];
    private filePath: string;
    private boundaries: BoundaryDTO[];

    constructor() {
        this.borings = [];
        this.layerColors = [];
        this.filePath = '';
    }

    // JSON 파일을 읽어들이는 메소드
    private async readProjectFile(path: string) {
        try {
            // 파일 경로 저장
            this.filePath = path;

            // 파일 읽기
            const data = await fs.readFile(path, 'utf-8');

            // JSON 파싱
            const jsonData = JSON.parse(data);

            // 필요한 데이터를 클래스의 멤버 변수로 저장
            this.landInfo = jsonData.landInfo;
            this.borings = jsonData.borings;
            this.layerColors = jsonData.layerColors;
            this.boundaries = jsonData.boundaries;

            return {result: true}
        } catch (error) {
            console.error('프로젝트 파일을 읽는 중 오류가 발생했습니다:', error);
            return {result: false, message: error}
        }
    }

    private async pushAllDatas() {
        try {
            // Register land info
            if(this.landInfo) {
                const data = this.landInfo as LandInfoDTO;
                await AppController.getInstance().repositories.landInfo.registerInfo(data, data.landId);
            } else {
                // For support legacy verions.
                await AppController.getInstance().repositories.landInfo.registerInfo({
                    name: DEFAULT_VALUES.DEFAULT_LANDINFO.name,
                    epsg: DEFAULT_VALUES.DEFAULT_LANDINFO.epsg
                }, new ElementId().getValue());
            }

            // Borings
            for(const boring of this.borings) {
                console.log(`Push ${boring.name}`);
                await AppController.getInstance().repositories.boring.insertBoring(boring);
            }
            
            for(const layer of this.layerColors) {
                console.log(`Push ${layer.layerName} - ${layer.colorIndex}`);
                await AppController.getInstance().repositories.boring.updateLayerColor(layer.layerName, layer.colorIndex);
            }

            // Boundaries
            await AppController.getInstance().repositories.boundary.insertBoundaries(this.boundaries);

            console.log('Pushed all datas');
        } catch (error) {
            console.log(`Error occured : ${error}`);
        }
    }

    setFilePath(path: string) {
        this.filePath = path;
    }

    async loadProjectFile() {
        try {
            const readJob = await this.readProjectFile(this.filePath);
            if(!readJob || !readJob.result)
                return;
            
            await AppController.getInstance().truncateDBSoft();
            
            await this.pushAllDatas();
            return {result: true};
        } catch (error) {
            console.log(error);
            return {result: false, message: error};
        }
    }
}