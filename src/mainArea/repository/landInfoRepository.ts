import { Database } from "sqlite";
import { RepositryQueryBuilder } from "./utils/queryBuilder";
import { DB_TABLENAMES } from "@/public/databaseProps";
import { SystemUtils } from "../utils/wrapper";
import { LandInfoDTO } from "@/dto/serviceModel/landInfo";

export type LandInfoModifyOption = {
    epsg?: number;
    name?: string;
}

type LandInfoProps = {
    land_id: string,
    epsg_code: number,
    name: string
}

const selectCountQuery = `
    SELECT 
        COUNT(*)
    FROM
        ${DB_TABLENAMES.LAND_INFO}
`;

const ID_COLUMN = "land_id";
export class LandInfoRepository {
    private db: Database;
    
    constructor(db: Database) {
        this.db = db;
    }

    async modifyInfo(option: LandInfoModifyOption) {
        try {
            await this.db.exec("BEGIN TRANSACTION");

            const getIdQuery = `
                SELECT land_id
                FROM
                    ${DB_TABLENAMES.LAND_INFO}
            `;

            const id = (await this.db.all(getIdQuery))[0].land_id;
            const columns: {column: string, value: string|number}[] = [];
            const {epsg, name} = option;

            if(name) {
                if(name.length === 0) {
                    SystemUtils.Modal.showError("이름 설정 오류", "이름은 공백으로 설정할 수 없습니다.");
                    return;
                }
                columns.push({column: 'name', value: option.name});
            }

            if(epsg) {
                columns.push({column: 'epsg_code', value: option.epsg});
            }
            
            if(columns.length === 0) return;
            
            const query = RepositryQueryBuilder.buildUpdateQuery(DB_TABLENAMES.LAND_INFO, columns.map(c => c.column), ID_COLUMN);

            await this.db.run(query,[...columns.map(c => c.value), id]);

            await this.db.exec('COMMIT');

            return {result: true};
        } catch (error) {
            return {result: false, message: String(error)};
        }        
    }

    async registerInfo(info: Required<LandInfoModifyOption>, id: string) {
        try {
            const {epsg, name} = info;
            const countResult = await this.db.get<{ 'COUNT(*)': number }>(selectCountQuery);
            const count = countResult['COUNT(*)'];

            if(count === 0) {
                const query = RepositryQueryBuilder.buildInsertQuery(DB_TABLENAMES.LAND_INFO, ['land_id', 'epsg_code', 'name']);
                await this.db.run(query, [id, epsg, name]);
            } else {
                const query = RepositryQueryBuilder.buildUpdateQuery(DB_TABLENAMES.LAND_INFO, ['epsg_code', 'name'], 'land_id');
                await this.db.run(query, [epsg, name, id]);
            }
            return {result: true}
        } catch (error) {
            console.error(error);
            return {result: false, message: String(error)}
        }
    }

    async fetchInfo(): Promise<{result: boolean, message?: string, landInfo?: LandInfoDTO}> {
        const query = `
            SELECT *
            FROM
                ${DB_TABLENAMES.LAND_INFO}
        `

        const landInfos: LandInfoProps[] = await this.db.all(query);
        if(!landInfos || landInfos.length === 0) {
            return {result: false, message: "No land info."};
        }

        const landInfo: LandInfoDTO = {
            landId: landInfos[0].land_id,
            name: landInfos[0].name,
            epsg: landInfos[0].epsg_code,
        }
        
        return {result: true, landInfo: landInfo}
    }
}