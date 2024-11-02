import { TopoDTO } from "../../dto/serviceModel/topoDto";
import { Database } from "sqlite";
import { RepositryQueryBuilder } from "./utils/queryBuilder";
import { DB_TABLENAMES } from "../../public/databaseProps";
import { ModelType } from "../models/modelType";

interface TopoCRUDMethods {
    insertTopo(topoDto: TopoDTO): Promise<{result: boolean, message?: string}>;
    fetchAllTopos(): Promise<{result: boolean, message?: string, topoDatas?: TopoDTO[]}>;
    updateTopoColor(id:string, index: number) : Promise<{result: boolean, message?: string}>;
    removeTopos(ids: string[]): Promise<{result: boolean, message?: string}>;
}

interface TopoProp {
    topo_id: string,
    topo_name: string,
    color_index: number,
    is_batched: 0 | 1,
    three_id: string,
}

interface TopoPoint {
    topo_id: string,
    coord_x: number,
    coord_y: number,
    coord_z: number
}

export class TopoRepository implements TopoCRUDMethods {
    private db: Database;
    
    constructor(db: Database) {
        this.db = db;
    }
    
    async insertTopo(topoDto: TopoDTO): Promise<{ result: boolean; message?: string; }> {
        const headerQuery = RepositryQueryBuilder.buildInsertQuery(DB_TABLENAMES.TOPOS, ['topo_id', 'topo_name', 'color_index', 'is_batched', 'three_id']);
        try {
            await this.db.exec('BEGIN TRANSACTION');

            // Insert topo header
            await this.db.all(headerQuery, [topoDto.id, topoDto.name, topoDto.colorIndex, topoDto.isBatched, topoDto.threeObjId]);
            
            // Insert topo points
            const ptQuery = RepositryQueryBuilder.buildInsertQuery(DB_TABLENAMES.TOPO_POINTS, ['topo_id', 'coord_x', 'coord_y', 'coord_z']);
            for(const pt of topoDto.points) {
                await this.db.all(ptQuery, [topoDto.id, pt.x, pt.y, pt.z]);
            }

            await this.db.exec('COMMIT');

            return {result: true}
        } catch (error) {
            console.log(error);
            await this.db.exec('ROLLBACK');
            return {result: false, message: error ? error.toString() : null }
        }
    }
    async fetchAllTopos(): Promise<{ result: boolean; message?: string; topoDatas?: TopoDTO[]; }> {
        const topoQuery = `
        SELECT
            topo_id, topo_name, color_index, is_batched, three_id
        FROM
            ${DB_TABLENAMES.TOPOS}
        `;

        const pointQuery = `
        SELECT
            topo_id, coord_x, coord_y, coord_z
        FROM
            ${DB_TABLENAMES.TOPO_POINTS} tp
        `;

        try {
            const topos:TopoProp[] = await this.db.all(topoQuery);
            const topoMap: Map<string, TopoDTO> = new Map();
            topos.forEach(topo => {
                const dto: TopoDTO = {
                    id: topo.topo_id,
                    modelType: ModelType.Topo,
                    name: topo.topo_name,
                    colorIndex: topo.color_index,
                    isBatched: topo.is_batched,
                    threeObjId: topo.three_id,
                    points: []
                }
                topoMap.set(topo.topo_id, dto);
            });

            const points:TopoPoint[] = await this.db.all(pointQuery);
            points.forEach(pt => {
                topoMap.get(pt.topo_id).points.push({
                    id: pt.topo_id,
                    x: pt.coord_x,
                    y: pt.coord_y,
                    z: pt.coord_z
                });
            });           
            return {result: true, topoDatas: Array.from(topoMap.values())}
        } catch (error) {
            console.log(error);
            return {result: false, message: error ? error.toString() : null }
        }
    }

    async updateTopoColor(id:string, index: number): Promise<{ result: boolean; message?: string; }> {
        const query = RepositryQueryBuilder.buildUpdateQuery(DB_TABLENAMES.TOPOS, ['color_index'], 'topo_id');
        try {
            await this.db.exec('BEGIN TRANSACTION');
            
            await this.db.all(query, [index, id]);

            await this.db.exec('COMMIT');

            return {result: true}
        } catch (error) {
            console.log(error);
            await this.db.exec('ROLLBACK');
            return {result: false, message: error ? error.toString() : null }
        }
    }

    async removeTopos(ids: string[]): Promise<{ result: boolean; message?: string; }> {
        const query = `
            DELETE
            FROM
                ${DB_TABLENAMES.TOPOS}
            WHERE
                topo_id = ?
        `;
        try {
            await this.db.exec('BEGIN TRANSACTION');

            // Delete items
            for(const id of ids) {
                await this.db.all(query, id);
            }
            
            await this.db.exec('COMMIT');

            return {result: true}
        } catch (error) {
            console.log(error);
            await this.db.exec('ROLLBACK');
            return {result: false, message: error ? error.toString() : null }
        }
    }

    async updateThreeObjId(ids: {id: string, threeObjId: string}[]): Promise<{result: boolean, message?: string}> {
        const query = RepositryQueryBuilder.buildUpdateQuery(
            DB_TABLENAMES.TOPOS,
            ['three_id'],
            'topo_id'
        )

        try {
            await this.db.exec('BEGIN TRANSACTION');

            const promises = ids.map(async (id) => {
                await this.db.all(query, [id.threeObjId, id.id]);
            });
            await Promise.all(promises);

            await this.db.exec('COMMIT');

            return {result: true}
        } catch (error) {
            console.log(error);
            await this.db.exec('ROLLBACK');
            return {result: false, message: error ? error.toString() : null }
        }
    }
}