import { TopoDTO } from "../../dto/serviceModel/topoDto";
import { Database } from "sqlite";
import { RepositryQueryBuilder } from "./utils/queryBuilder";
import { DB_TABLENAMES } from "../../public/databaseProps";
import { ModelType } from "../models/modelType";
import { TopoType } from "../models/topoType";
import { TriangleSet } from "../types/triangleDataSet";
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
    topo_anchor_x?: number,
    topo_anchor_y?: number,
    topo_rotation?: number,
    topo_resolution?: number
}

interface TopoPoint {
    topo_id: string,
    point_index?: number,
    coord_x: number,
    coord_y: number,
    coord_z: number
}

interface ZCoord {
    topo_id: string,
    index_i: number,
    index_j: number,
    coord_z: number
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
        const headerQuery = RepositryQueryBuilder.buildInsertQuery(DB_TABLENAMES.TOPOS, [
            'topo_id', 
            'topo_name', 
            'topo_type', 
            'color_index', 
            'is_batched', 
            'three_id',
            'topo_anchor_x',
            'topo_anchor_y',
            'topo_rotation',
            'topo_resolution'
        ]);

        try {
            const start = performance.now();
            await this.db.exec('BEGIN TRANSACTION');
            
            // Insert topo header
            await this.db.all(headerQuery, [
                topoDto.id, 
                topoDto.name, 
                topoDto.topoType, 
                topoDto.colorIndex, 
                topoDto.isBatched, 
                topoDto.threeObjId,
                triangleSet.anchor.x,
                triangleSet.anchor.y,
                triangleSet.rotation,
                triangleSet.resolution
            ]);
            
            // Insert topo points
            const ptQuery = RepositryQueryBuilder.buildInsertQuery(DB_TABLENAMES.TOPO_POINTS_EXPLODED, [
                'topo_id', 
                'index_i', 
                'index_j', 
                'coord_z'
            ]);

            for(let i = 0; i < triangleSet.pts.length; i++) {
                const pt = triangleSet.pts[i]
                await this.db.run(ptQuery, [topoDto.id, pt.i, pt.j, pt.z]);
            }

            const end = performance.now();
            console.log(`Elapsed Time: ${end - start}`);
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
                resolution: topo.topo_resolution,
                triangles: {
                    pts: [],
                    anchor: { x: 0, y: 0 },
                    rotation: 0,
                    resolution: 0,
                    maxI: 0,
                    maxJ: 0
                }
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
                // Set other props
                const targetTopo = topoMap.get(topo.topo_id);
                targetTopo.triangles.anchor.x = topo.topo_anchor_x;
                targetTopo.triangles.anchor.y = topo.topo_anchor_y;
                targetTopo.triangles.rotation = topo.topo_rotation;
                targetTopo.triangles.resolution = topo.topo_resolution;
                
                // Insert pts
                const zCoordQuery = `
                    SELECT *
                    FROM ${DB_TABLENAMES.TOPO_POINTS_EXPLODED}
                `;
                
                const zCoords: ZCoord[] = await this.db.all(zCoordQuery, [topo.topo_id]);
                zCoords.forEach(coord => {
                    const topoDto = topoMap.get(coord.topo_id);
                    topoDto.triangles.pts.push({
                        z: coord.coord_z,
                        i: coord.index_i,
                        j: coord.index_j
                    });
                    topoDto.triangles.maxI = Math.max(coord.index_i, topoDto.triangles.maxI);
                    topoDto.triangles.maxJ = Math.max(coord.index_i, topoDto.triangles.maxJ);
                });
            }
        }

        return topoMap;
    }
}