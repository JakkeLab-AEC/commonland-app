import { BoringDTO } from "../../dto/serviceModel/BoringDTO";
import { Database } from "sqlite";
import { RepositryQueryBuilder } from "./utils/queryBuilder";
import { DB_TABLENAMES } from "../../public/databaseProps";
import { ModelType } from "../models/modelType";
import { DB_ERRORCODE, DBError } from "../../public/databaseErrors";

interface BoringCRUDMethods {
    insertBoring(boringDto: BoringDTO): Promise<{ result: boolean, message?: string }>;
    fetchAllBorings(): Promise<{ result: boolean, message?: string, boringDatas?: BoringDTO }>;
    updateBoring(boringDto: BoringDTO): Promise<{ result: boolean, message?: string}>;
    removeBoring(ids: string[]): Promise<{result: boolean, message?: string}>;
    updateBoringBatch(idAndOptions: {id: string, option: boolean}[]): Promise<{result: boolean, message?: string}>
}

interface BoringData {
    boring_id: string;
    name: string;
    location_x: number;
    location_y: number;
    topo_top: number;
    underground_water: number;
    is_batched: 0 | 1
}

interface LayerData {
    layer_id: string;
    boring_id: string;
    layer_index: number;
    name: string;
    thickness: number;
}

interface SptResultData {
    spt_id: string;
    boring_id: string;
    depth: number;
    hitcount: number;
    distance: number;
}

type BoringWithLayer = BoringData & LayerData ;
type BoringWithSPT = BoringData & SptResultData;

interface LayerColorData {
    name: string,
    color_index: number,
}

export class BoringRepository implements BoringCRUDMethods {
    private db: Database;
    
    constructor(db: Database) {
        this.db = db;
    }

    async fetchAllBorings(): Promise<{result: boolean, message?: string, fetchedBorings?: BoringDTO[]}> {
        try {

            // Pre-defined props
            const boringColumns = ['boring_id', 'name', 'location_x', 'location_y', 'topo_top', 'underground_water', 'is_batched'];
            const layerColumns = ['layer_id', 'boring_id', 'layer_index', 'name', 'thickness'];
            const sptResultColumns = ['spt_id', 'boring_id', 'depth', 'hitcount', 'distance'];
            
            const propsLayer = [
                ...boringColumns.map(col => `br.${col}`), 
                ...layerColumns.map(col => `ly.${col}`)
            ];
        
            const propsSPT = [
                ...boringColumns.map(col => `br.${col}`), 
                ...sptResultColumns.map(col => `sp.${col}`)
            ];

            // Prepare prestatement query
            const queryBorings = `
                SELECT
                    ${boringColumns}
                FROM
                    ${DB_TABLENAMES.BORINGS}
            `;

            const queryLayer =`
                SELECT
                    ${propsLayer.join(', ')}
                FROM
                    ${DB_TABLENAMES.BORINGS} br
                JOIN
                    ${DB_TABLENAMES.LAYERS} ly ON br.boring_id = ly.boring_id
                ORDER BY
                    br.boring_id, ly.layer_index
            `;
        
            const querySPT =`
                SELECT
                    ${propsSPT.join(', ')}
                FROM
                    ${DB_TABLENAMES.BORINGS} br
                JOIN
                    ${DB_TABLENAMES.SPT_RESULTS} sp ON br.boring_id = sp.boring_id
                ORDER BY
                    br.boring_id, sp.depth
            `;

            // Select borings
            const borings: BoringData[] = await this.db.all(queryBorings);

            // Select layers
            const layers: BoringWithLayer[] = await this.db.all(queryLayer);

            // Select spts
            const spts: BoringWithSPT[] = await this.db.all(querySPT);

            // Build boring DTO
            const fetchedBorings: BoringDTO[] = [];

            borings.forEach(boring => {
                const targetBoring: BoringDTO = {
                    name: boring.name,
                    topoTop: boring.topo_top,
                    undergroundWater: boring.underground_water,
                    layers: [],
                    location: {
                        x: boring.location_x,
                        y: boring.location_y
                    },
                    sptResults: [],
                    isBatched: boring.is_batched,
                    id: boring.boring_id,
                    modelType: ModelType.Service
                }

                // Get layers
                const targetLayers = layers.filter(layer => layer.boring_id == boring.boring_id);
                if(targetLayers.length > 0) {
                    const boringLayers = targetLayers.map(layer => {
                        return {
                            id: layer.layer_id,
                            layerIndex: layer.layer_index,
                            name: layer.name,
                            thickness: layer.thickness,
                        }
                    });

                    const orderedLayers = boringLayers.sort((a, b) => a.layerIndex - b.layerIndex);
                    targetBoring.layers = orderedLayers;
                }

                const targetSPTs = spts.filter(spt => spt.boring_id == boring.boring_id);
                if(targetSPTs.length > 0) {
                    const boringSPTs = targetSPTs.map(spt => {
                        return {
                            id: spt.spt_id,
                            depth: spt.depth,
                            hitCount: spt.hitcount,
                            distance: spt.distance,
                        }
                    });

                    const orderedSPTs = boringSPTs.sort((a, b) => a.depth - b.depth);
                    targetBoring.sptResults = orderedSPTs;
                }

                fetchedBorings.push(targetBoring);
            });
            
            return {
                result: true,
                fetchedBorings: fetchedBorings
            }
        } catch (error) {
            console.log(error);
            return {
                result: false,
                message: typeof error === 'string' ? error : ""
            };
        }
    }

    async insertBoring(boringDto: BoringDTO): Promise<{result: boolean, message?: string}> {
        const boringColumns = ['boring_id', 'name', 'location_x', 'location_y', 'topo_top', 'underground_water', 'is_batched'];
        const layerColumns = ['layer_id', 'boring_id', 'layer_index', 'name', 'thickness'];
        const sptResultColumns = ['spt_id', 'boring_id', 'depth', 'hitCount', 'distance'];

        const boringInsertQuery = RepositryQueryBuilder.buildInsertQuery(DB_TABLENAMES.BORINGS, boringColumns);
        const boringParams = [
            boringDto.id,
            boringDto.name,
            boringDto.location.x,
            boringDto.location.y,
            boringDto.topoTop,
            boringDto.undergroundWater,
            boringDto.isBatched
        ];
        
        const layerInsertQuery = RepositryQueryBuilder.buildInsertQuery(DB_TABLENAMES.LAYERS, layerColumns);
        const layerParams = boringDto.layers.map(layer => {
            return [
                layer.id,
                boringDto.id,
                layer.layerIndex,
                layer.name,
                layer.thickness
            ];
        })

        const sptResultInsertQuery = RepositryQueryBuilder.buildInsertQuery(DB_TABLENAMES.SPT_RESULTS, sptResultColumns);
        const sptResultParams = boringDto.sptResults.map(spt => {
            return [
                spt.id,
                boringDto.id,
                spt.depth,
                spt.hitCount,
                spt.distance
            ];
        })

        try {
            // Transaction start
            await this.db.exec('BEGIN TRANSACTION');
            
            // Insert all datas
            await this.db.all(boringInsertQuery, boringParams);

            if(layerParams.length > 0) {
                for(const layerParam of layerParams) {
                    await this.db.all(layerInsertQuery, layerParam);
                }
            }

            if(sptResultParams.length > 0) {
                for(const sptResultParam of sptResultParams) {
                    await this.db.all(sptResultInsertQuery, sptResultParam);
                }
            }

            // COMMIT
            await this.db.exec('COMMIT');
            
            console.log('Insert Done');
            return {result: true}
        } catch (error) {
            await this.db.exec('ROLLBACK');
            console.log(error);
            return {result: false, message: typeof error === 'string' ? error : ""}
        }
    }

    async updateBoring(boringDto: BoringDTO): Promise<{result: boolean, message?: string, updateError?: DBError}> {
        // Update mode
        let updateMode: 'noRenaming'|'Renaming' = 'Renaming';
        
        // Pre-check - Search boring names for prevention of Unique constrain error.
        const query = `
            SELECT 
                boring_id, name
            FROM 
                ${DB_TABLENAMES.BORINGS}
            WHERE
                name = ?
        `
        const searchJob = await this.db.all(query, boringDto.name);
        if(!searchJob) {
            return {result: false, updateError: DB_ERRORCODE['internalError']}
        }

        if(searchJob.length != 0) {
            if(searchJob.filter(col => col.boring_id == boringDto.id).length == 0) {
                return {result: false, updateError: DB_ERRORCODE['nameDuplication']}
            } else {
                updateMode = 'noRenaming';
            }
        }
        
        // Update works
        const boringColumnsNoRenaming = ['location_x', 'location_y', 'topo_top', 'underground_water', 'is_batched'];
        const boringColumns = ['name', 'location_x', 'location_y', 'topo_top', 'underground_water', 'is_batched'];
        const {name, location, topoTop, undergroundWater, id, isBatched} = boringDto;
        
        const layerColumns = ['layer_id', 'boring_id', 'layer_index', 'name', 'thickness'];
        const sptResultColumns = ['spt_id', 'boring_id', 'depth', 'hitCount', 'distance'];

        const queryBoring = updateMode == 'Renaming' ? 
            RepositryQueryBuilder.buildUpdateQuery(DB_TABLENAMES.BORINGS, boringColumns, 'boring_id') : 
            RepositryQueryBuilder.buildUpdateQuery(DB_TABLENAMES.BORINGS, boringColumnsNoRenaming, 'boring_id');
        
        const layerInsertQuery = RepositryQueryBuilder.buildInsertQuery(DB_TABLENAMES.LAYERS, layerColumns);
        const layerParams = boringDto.layers.map(layer => {
            return [
                layer.id,
                boringDto.id,
                layer.layerIndex,
                layer.name,
                layer.thickness
            ];
        })

        const sptResultInsertQuery = RepositryQueryBuilder.buildInsertQuery(DB_TABLENAMES.SPT_RESULTS, sptResultColumns);
        const sptResultParams = boringDto.sptResults.map(spt => {
            return [
                spt.id,
                boringDto.id,
                spt.depth,
                spt.hitCount,
                spt.distance
            ];
        })

        try {
            await this.db.exec('BEGIN TRANSACTION');

            // Update boring data
            const updateJob = updateMode == 'Renaming' ? 
                await this.db.all(queryBoring, [name, location.x, location.y, topoTop, undergroundWater, isBatched, id]) :
                await this.db.all(queryBoring, [location.x, location.y, topoTop, undergroundWater, isBatched, id])

            // Update layer data
            const layerDeleteQuery = `
                DELETE FROM ${DB_TABLENAMES.LAYERS} WHERE boring_id = ?
            `;

            await this.db.all(layerDeleteQuery, boringDto.id);
            
            if(layerParams.length > 0) {
                for(const layerParam of layerParams) {
                    await this.db.all(layerInsertQuery, layerParam);
                }
            }
            
            // Update SPT Data
            const sptDeleteQuery = `
                DELETE FROM ${DB_TABLENAMES.SPT_RESULTS} WHERE boring_id = ?
            `

            await this.db.all(sptDeleteQuery, boringDto.id);

            if(sptResultParams.length > 0) {
                for(const sptResultParam of sptResultParams) {
                    await this.db.all(sptResultInsertQuery, sptResultParam);
                }
            }

            await this.db.exec('COMMIT');

            return {result: true}
        } catch (error) {
            await this.db.exec('ROLLBACK');
            console.log(error);
            return {result: false, message: typeof error === 'string' ? error : ""}
        }
    }

    async updateBoringBatch(idAndOptions: {id: string, option: boolean}[]): Promise<{result: boolean, message?: string}> {
        const query = RepositryQueryBuilder.buildUpdateQuery(DB_TABLENAMES.BORINGS, ['is_batched'], 'boring_id');
        try {
            await this.db.exec('BEGIN TRANSACTION');

            for(const option of idAndOptions) {
                await this.db.all(query, [option.option ? 1 : 0, option.id]);
            }

            await this.db.exec('COMMIT');

            return {
                result: true
            }
        } catch (error) {
            await this.db.exec('ROLLBACK');
            console.log(error);
            return {
                result: false,
                message: typeof error === 'string' ? error : ""
            }
        }
    }

    async removeBoring(ids: string[]): Promise<{result: boolean, message?: string}> {
        const query = `
            DELETE FROM ${DB_TABLENAMES.BORINGS} WHERE boring_id = ?
        `;
        
        try {
            await this.db.exec('BEGIN TRANSACTION');
            
            for(const id of ids) {
                await this.db.all(query, id);
            }
            
            await this.db.exec('COMMIT');

            return {
                result: true
            }
        } catch (error) {
            await this.db.exec('ROLLBACK');
            console.log(error)
            return {
                result: false,
                message: typeof error === 'string' ? error : ""
            }
        }
    }

    async searchBoringNamePattern(prefix: string, index:number): Promise<{result: boolean, message?: string, searchedNames?: string[]}> {
        try {
            const query = `
                SELECT
                    name
                FROM
                    ${DB_TABLENAMES.BORINGS}
                WHERE
                    name LIKE '${prefix}-%'
                    AND CAST(SUBSTR(name, LENGTH('${prefix}-') + 1) AS INTEGER) >= ${index}
                ORDER BY
                    CAST(SUBSTR(name, LENGTH('${prefix}-') + 1) AS INTEGER) ASC
            `;

            const result = await this.db.all(query);
            if (result && result.length > 0) {
                const searchedNames = result.map((row: { name: string }) => row.name);
                return { result: true, searchedNames };
            } else {
                return { result: false, message: `No names found with index greater than ${index}`, searchedNames: []};
            }
        } catch (error) {
            console.log(error);
            return {
                result: false,
                message: typeof error === 'string' ? error : ""
            };
        }
    }

    async searchBoringName(name: string): Promise<{result: boolean, message?: string, error?: boolean}> {
        const query = `
            SELECT 
                name
            FROM 
                ${DB_TABLENAMES.BORINGS}
            WHERE
                name = ?
        `

        try {
            const searchJob = await this.db.all(query, name);
            if(searchJob.length == 0) {
                return {
                    result: false,
                    error: false,
                }
            } else {
                return {
                    result: true,
                }
            }
        } catch (error) {
            console.log(error);
            return {
                result: false,
                error: true,
                message: typeof error === 'string' ? error : ""
            }
        }
    }

    async getAllLayerColors(): Promise<{result: boolean, message?: string, layerColors?: [string, number][]}> {
        const query =`
            SELECT * FROM ${DB_TABLENAMES.LAYER_COLORS};
        `;
        
        try {
            const layerColors: [string, number][] = [];
            const results:LayerColorData[] = await this.db.all(query);
            for(const result of results) {
                layerColors.push([result.name, result.color_index]);
            }

            return {result: true, layerColors: layerColors}
        } catch (error) {
            console.log(error);
            return {result: false, message: typeof error === 'string' ? error : ""}
        }
    }

    async updateLayerColor(layerName: string, colorIndex: number): Promise<{result: boolean, message?: string}> {
        const query = RepositryQueryBuilder.buildUpdateQuery(DB_TABLENAMES.LAYER_COLORS, ['name', 'color_index'], 'name');
        try {
            await this.db.all(query, [layerName, colorIndex, layerName]);
            return {result: true}
        } catch (error) {
            console.log(error);
            return {result: false, message: typeof error === 'string' ? error : ""}
        }
    }
}