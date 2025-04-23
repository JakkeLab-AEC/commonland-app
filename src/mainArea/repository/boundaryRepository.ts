import { Database } from "sqlite";
import { RepositryQueryBuilder } from "./utils/queryBuilder";
import { DB_TABLENAMES } from "@/public/databaseProps";
import { BoundaryDto } from "@/dto/serviceModel/boundaryDto";


type BoundarySelectResult = {
    boundary_id: string,
    three_obj_id: string,
    boundary_name: string
};

type PtsSelectResult = {
    boundary_id: string,
    point_index: number,
    coord_x: number,
    coord_y: number,
};

const selectBoundaryQuery = `
    SELECT *
    FROM ${DB_TABLENAMES.BOUNDARIES}
    WHERE boundary_id = ?
`;

const selectAllBoundaryQuery = `
    SELECT *
    FROM ${DB_TABLENAMES.BOUNDARIES}
`;

const selectPtsQuery = `
    SELECT *
    FROM ${DB_TABLENAMES.BOUNDARY_POINTS}
    WHERE boundary_id = ?
    ORDER BY point_index
`;

export class BoundaryRepository {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    async insertBoundaries(data: BoundaryDto): Promise<{result: boolean, message?: string, boundary?: BoundaryDto}> {
        const insertBoundaryQuery = RepositryQueryBuilder.buildInsertQuery(DB_TABLENAMES.BOUNDARIES, [
            "boundary_id",
            "three_obj_id",
            "boundary_name"
        ]);

        const insertPointsQuery = RepositryQueryBuilder.buildInsertQuery(DB_TABLENAMES.BOUNDARY_POINTS, [
            "boundary_id",
            "point_index",
            "coord_x",
            "coord_y"
        ]);

        try {
            await this.db.run('BEGIN TRANSACTION');

            await this.db.all(insertBoundaryQuery, [
                data.id,
                data.threeObjId,
                data.name
            ]);

            for(let i = 0; i < data.pts.length; i++) {
                const pt = data.pts[i];
                await this.db.all(insertPointsQuery, [
                    data.id,
                    i,
                    pt.x,
                    pt.y
                ]);
            }

            await this.db.run('COMMIT');
            return {result: true, boundary: data}
        } catch (error) {
            await this.db.run('ROLLBACK');
            return {result: false, message: String(error)}
        }
    }

    async deleteBoundaries(ids: string[]): Promise<{result: boolean, message?: string}> {
        try {
            await this.db.run('BEGIN TRANSACTION');

            for(const id of ids) {
                await this.db.run(`DELETE FROM ${DB_TABLENAMES.BOUNDARIES} WHERE boundary_id = ?`, [id])
            }

            await this.db.run('COMMIT');
            return {result: true}
        } catch (error) {
            await this.db.run('ROLLBACK');
            return {result: false, message: String(error)}
        }
    }

    async selectBoundary(id: string): Promise<{result: boolean, message?: string, boundaries?: BoundaryDto[]}> {
        try {
            const boundaryResult = await this.db.all(selectBoundaryQuery, [id]) as BoundarySelectResult[];
            const ptsResult = await this.db.all(selectPtsQuery, [id]) as PtsSelectResult[];
            
            const dto: BoundaryDto = {
                id: id,
                threeObjId: boundaryResult[0].three_obj_id,
                name: boundaryResult[0].boundary_name,
                pts: ptsResult.sort((a, b) => a.point_index - b.point_index).map(p => {return {x: p.coord_x, y: p.coord_y}})
            }

            return {result: true, boundaries: [dto]};
        } catch (error) {
            return {result: false, message: String(error)};
        }
    }

    async selectAllBoundaries(): Promise<{result: boolean, message?: string, boundaries?: BoundaryDto[]}> {
        try {
            const boundaries: BoundaryDto[] = [];

            const boundaryResult = await this.db.all(selectBoundaryQuery) as BoundarySelectResult[];
            for(const boundary of boundaryResult) {
                const ptsResult = await this.db.all(selectPtsQuery, boundary.boundary_id);

                if(boundaries.length !== 0) {
                    boundaries.push({
                        id: boundary.boundary_id,
                        threeObjId: boundary.three_obj_id,
                        name: boundary.boundary_name,
                        pts: ptsResult.sort((a, b) => a.point_index - b.point_index).map(p => {return {x: p.coord_x, y: p.coord_y}})
                    });
                }
            }

            return {result: true, boundaries: boundaries};
        } catch (error) {
            return {result: false, message: String(error)};
        }
    }
}