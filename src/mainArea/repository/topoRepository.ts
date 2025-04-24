import { TopoDTO } from "../../dto/serviceModel/topoDto";
import { Database } from "sqlite";
import { RepositryQueryBuilder } from "./utils/queryBuilder";
import { DB_TABLENAMES } from "../../public/databaseProps";
import { ModelType } from "../models/modelType";
import { TopoType } from "../models/topoType";
import { TriangleIndexSet, TriangleSet } from "../types/triangleDataSet";
import { Vector3d } from "../types/vector";

interface TopoCRUDMethods {
    insertTopo(topoDto: TopoDTO): Promise<{result: boolean, message?: string}>;
    fetchAllTopos(): Promise<{result: boolean, message?: string, topoDatas?: TopoDTO[]}>;
    updateTopoColor(id:string, index: number) : Promise<{result: boolean, message?: string}>;
    removeTopos(ids: string[]): Promise<{result: boolean, message?: string}>;
}

interface TopoProp {
    topo_id: string,
    topo_name: string,
    topo_type: string,
    color_index: number,
    is_batched: 0 | 1,
    three_id: string,
}

interface TopoPoint {
    topo_id: string,
    point_index?: number,
    coord_x: number,
    coord_y: number,
    coord_z: number
}

interface TriangleResult {
    topo_id: string,
    index_n: number,
    index_i: number,
    index_j: number
}

const topoSelectQuery = `
    SELECT
        topo_id, topo_name, color_index, is_batched, three_id
    FROM
        ${DB_TABLENAMES.TOPOS}
`;

const topoSelectByIdQuery = `
    SELECT
        topo_id, topo_name, color_index, is_batched, three_id
    FROM
        ${DB_TABLENAMES.TOPOS}
    WHERE
        topo_id = ?
`;

const pointQuery = `
    SELECT
        topo_id, point_index, coord_x, coord_y, coord_z
    FROM
        ${DB_TABLENAMES.TOPO_POINTS} tp
`;

const triangleQuery = `
    SELECT *
    FROM
        ${DB_TABLENAMES.TOPO_TRIANGLES}
`;

export class TopoRepository implements TopoCRUDMethods {
    private db: Database;
    
    constructor(db: Database) {
        this.db = db;
    }
    
    async insertTopo(topoDto: TopoDTO): Promise<{ result: boolean; message?: string; }> {
        const headerQuery = RepositryQueryBuilder.buildInsertQuery(DB_TABLENAMES.TOPOS, ['topo_id', 'topo_name', 'topo_type', 'color_index', 'is_batched', 'three_id']);
        try {
            await this.db.exec('BEGIN TRANSACTION');

            // Insert topo header
            await this.db.all(headerQuery, [topoDto.id, topoDto.name, topoDto.topoType, topoDto.colorIndex, topoDto.isBatched, topoDto.threeObjId]);
            
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

    async insertTopoKrigged(topoDto: TopoDTO, triangleSet: TriangleSet): Promise<{ result: boolean; message?: string; topoDataSet?: TriangleSet}> {
        const headerQuery = RepositryQueryBuilder.buildInsertQuery(DB_TABLENAMES.TOPOS, ['topo_id', 'topo_name', 'topo_type', 'color_index', 'is_batched', 'three_id']);
        try {
            await this.db.exec('BEGIN TRANSACTION');
            
            // Insert topo header
            await this.db.all(headerQuery, [topoDto.id, topoDto.name, topoDto.topoType, topoDto.colorIndex, topoDto.isBatched, topoDto.threeObjId]);
            
            // Insert topo points
            const ptQuery = RepositryQueryBuilder.buildInsertQuery(DB_TABLENAMES.TOPO_POINTS, ['topo_id', 'point_index', 'coord_x', 'coord_y', 'coord_z']);
            const ptIndexHash: Map<string, number> = new Map();
            for(let i = 0; i < triangleSet.pts.length; i++) {
                const ptIndex = i;
                const pt = triangleSet.pts[i].pt;
                await this.db.run(ptQuery, [topoDto.id, ptIndex, pt.x, pt.y, pt.z]);

                ptIndexHash.set(triangleSet.pts[i].hash, i);
            }

            // Insert topo triangles
            const triangleQuery = RepositryQueryBuilder.buildInsertQuery(DB_TABLENAMES.TOPO_TRIANGLES, [
                'topo_id',
                'index_n',
                'index_i',
                'index_j'
            ]);

            for(const triangle of triangleSet.triangles) {
                const p0Index = ptIndexHash.get(triangle.hashPt0);
                const p1Index = ptIndexHash.get(triangle.hashPt1);
                const p2Index = ptIndexHash.get(triangle.hashPt2);

                await this.db.run(triangleQuery, [topoDto.id, p0Index, p1Index, p2Index]);
            }

            await this.db.exec('COMMIT');
            return {result: true, topoDataSet: triangleSet}
        } catch (error) {
            console.log(error);
            await this.db.exec('ROLLBACK');
            return {result: false, message: error ? error.toString() : null }
        }
    }

    async fetchAllTopos(): Promise<{ result: boolean; message?: string; topoDatas?: TopoDTO[]; }> {
        try {
            const topos: TopoProp[] = await this.db.all(topoSelectQuery);
            const topoMap: Map<string, TopoDTO> = await this.buildTopoMap(topos);
            return {result: true, topoDatas: Array.from(topoMap.values())}
        } catch (error) {
            console.log(error);
            return {result: false, message: error ? error.toString() : null }
        }
    }

    async fetchTopo(id: string): Promise<{ result: boolean; message?: string; topoData?: TopoDTO; }> {
        try {
            const topos: TopoProp[] = await this.db.all(topoSelectByIdQuery, [id]);
            const topoMap: Map<string, TopoDTO> = await this.buildTopoMap(topos);
            return {result: true, topoData: Array.from(topoMap.values())[0]}
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

    private async buildTopoMap(topoProps: TopoProp[]): Promise<Map<string, TopoDTO>> {
        const topoMap: Map<string, TopoDTO> = new Map();
        for(const topo of topoProps){
            // Fetch topo header data.
            const dto: TopoDTO = {
                id: topo.topo_id,
                modelType: ModelType.Topo,
                name: topo.topo_name,
                colorIndex: topo.color_index,
                isBatched: topo.is_batched,
                threeObjId: topo.three_id,
                points: [],
                topoType: TopoType.DelaunayMesh,
                resolution: 1,
            }
            topoMap.set(topo.topo_id, dto);
    
            if(topo.topo_type === TopoType.DelaunayMesh) {
                const points: TopoPoint[] = await this.db.all(pointQuery);
                points.forEach(pt => {
                    topoMap.get(pt.topo_id).points.push({
                        id: pt.topo_id,
                        x: pt.coord_x,
                        y: pt.coord_y,
                        z: pt.coord_z
                    });
                });
            } else if (topo.topo_type === TopoType.OrdinaryKriging) {
                const points: TopoPoint[] = await this.db.all(pointQuery);
                const indexedPts: Map<string, Vector3d> = new Map();
                points.sort((a, b) => a.point_index - b.point_index).forEach(pt => {
                    indexedPts.set(`${pt.topo_id}_${pt.point_index}`, {
                        x: pt.coord_x, 
                        y: pt.coord_y,
                        z: pt.coord_z
                    });
    
                    topoMap.get(pt.topo_id).points.push({
                        index: pt.point_index,
                        x: pt.coord_x,
                        y: pt.coord_y,
                        z: pt.coord_z
                    });
                });
    
                const triangles: TriangleResult[] = await this.db.all(triangleQuery);
                triangles.forEach(t => {
                    topoMap.get(t.topo_id).triangles.push({
                        indexP0: t.index_n,
                        indexP1: t.index_i,
                        indexP2: t.index_j
                    });
                });
            }
        }

        return topoMap;
    }
}