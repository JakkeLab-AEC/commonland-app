import { BoringDTO } from "../../dto/serviceModel/BoringDTO";
import { LayerColorConfig } from "../models/uimodels/layerColorConfig";
import { AppController } from "./appController";
import * as fs from 'fs/promises';

export class ProjectWrite {
    private borings: BoringDTO[];
    private layerColors: {layerName: string, colorIndex: number}[];
    private filePath: string;

    private async writeBoringDatas() {
        this.borings = [];
        const fetchAllBoringJob = await AppController.getInstance().getRepository('Boring').fetchAllBorings();
        if(fetchAllBoringJob.result) {
            this.borings.push(...fetchAllBoringJob.fetchedBorings);
        }
    }

    private async writeLayerConfig() {
        this.layerColors = [];
        const fetchLayerConfigJob = await AppController.getInstance().getRepository('Boring').getAllLayerColors();
        if(fetchLayerConfigJob.result) {
            fetchLayerConfigJob.layerColors.forEach(ly => {
                this.layerColors.push({
                    layerName: ly[0],
                    colorIndex: ly[1]
                });
            })
        }
    }

    async createSaveFile() {
        // Write data
        await this.writeBoringDatas();
        await this.writeLayerConfig();

        // Create JSON data
        const dataToSave = {
            borings: this.borings,
            layerColors: this.layerColors
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
    private borings: BoringDTO[];
    private layerColors: {layerName: string, colorIndex: number}[];
    private filePath: string;

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
            this.borings = jsonData.borings;
            this.layerColors = jsonData.layerColors;

            console.log(this.borings);
            console.log(this.layerColors);

            console.log('프로젝트 파일이 성공적으로 읽어들여졌습니다.');
            return {result: true}
        } catch (error) {
            console.error('프로젝트 파일을 읽는 중 오류가 발생했습니다:', error);
            return {result: false, message: error}
        }
    }

    private async pushAllDatas() {
        try {
            for(const boring of this.borings) {
                console.log(`Push ${boring.name}`);
                await AppController.getInstance().getRepository('Boring').insertBoring(boring);
            }
            
            for(const layer of this.layerColors) {
                console.log(`Push ${layer.layerName} - ${layer.colorIndex}`);
                await AppController.getInstance().getRepository('Boring').updateLayerColor(layer.layerName, layer.colorIndex);
            }

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