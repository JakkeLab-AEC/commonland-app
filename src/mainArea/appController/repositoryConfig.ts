import { app } from "electron";
import {Database, open} from 'sqlite';
import sqlite3 from 'sqlite3';
import path from "path";
import fs from 'fs';
import { DB_TABLENAMES } from "../../public/databaseProps";

export async function openDB() {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'database.db');

    console.log(dbPath);
    // Ensure the directory exists
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });

    try {
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });

        // Enable foreign key support
        await db.run('PRAGMA foreign_keys = OFF');
    
        await initializeDB(db);

        return db;
    } catch (error) {
        console.error('Failed to open database:', error);
        throw error;
    }
}

const updateLayerTrigger = `
    CREATE TRIGGER update_layer_color_on_name_change
    AFTER UPDATE ON ${DB_TABLENAMES.LAYERS}
    FOR EACH ROW
    BEGIN
        -- 새로운 이름이 기존 레이어에 존재하지 않는 경우에만 색상 추가
        INSERT OR IGNORE INTO ${DB_TABLENAMES.LAYER_COLORS} (name, color_index)
        VALUES (NEW.name, 1);

        -- 기존 이름이 더 이상 사용되지 않으면 색상 삭제
        DELETE FROM ${DB_TABLENAMES.LAYER_COLORS}
        WHERE name = OLD.name
        AND NOT EXISTS (
            SELECT 1 FROM ${DB_TABLENAMES.LAYERS} WHERE name = OLD.name
        );

        -- 병합된 경우 중복된 색상 삭제
        DELETE FROM ${DB_TABLENAMES.LAYER_COLORS}
        WHERE name = NEW.name
        AND EXISTS (
            SELECT 1 FROM ${DB_TABLENAMES.LAYER_COLORS} WHERE name = OLD.name
        );
    END;
`;

const insertLayerTrigger = `
    CREATE TRIGGER insert_layer_color_if_not_exists
    AFTER INSERT ON ${DB_TABLENAMES.LAYERS}
    FOR EACH ROW
    WHEN (NEW.name IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM ${DB_TABLENAMES.LAYER_COLORS} WHERE name = NEW.name
    ))
    BEGIN
        INSERT INTO 
            ${DB_TABLENAMES.LAYER_COLORS} (name, color_index)
        VALUES
            (NEW.name, 1);
    END;
`;

const removeLayerTrigger = `
    CREATE TRIGGER delete_layer_color_if_no_layers
    AFTER DELETE ON ${DB_TABLENAMES.LAYERS}
    FOR EACH ROW
    WHEN NOT EXISTS (
        SELECT 1 FROM ${DB_TABLENAMES.LAYERS} WHERE name = OLD.name
    )
    BEGIN
        DELETE FROM ${DB_TABLENAMES.LAYER_COLORS} WHERE name = OLD.name;
    END;
`;

async function initializeDB(db: Database) {
    //DB Truncate : Delete all table
    await db.run("PRAGMA foreign_keys = OFF;");
    const tables = await db.all(`
        SELECT name FROM sqlite_master WHERE type='table';
    `);
    
    let i = 1;
    for (const { name } of tables) {
        console.log(`Job ${i++} : Drop Table ${name}`);
        // 테이블에 해당하는 트리거 삭제
        await db.run(`DROP TRIGGER IF EXISTS insert_layer_color_if_not_exists;`);
        await db.run(`DROP TRIGGER IF EXISTS delete_layer_color_if_no_layers;`);
        await db.run(`DROP TRIGGER IF EXISTS update_layer_color_on_name_change;`);
        await db.run(`DROP TABLE IF EXISTS "${name}";`);
    }
    
    console.log("Existing tables dropped");

    await db.exec(`
        CREATE TABLE ${DB_TABLENAMES.LAND_INFO} (
            land_id TEXT PRIMARY KEY,
            name TEXT
        );

        CREATE TABLE ${DB_TABLENAMES.BORINGS} (
            boring_id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            location_x NUMERIC NOT NULL,
            location_y NUMERIC NOT NULL,
            topo_top NUMERIC NOT NULL,
            is_batched INTEGER NOT NULL CHECK (is_batched IN (0, 1)),
            three_id TEXT,
            underground_water NUMERIC NOT NULL
        );

        CREATE TABLE ${DB_TABLENAMES.LAYERS} (
            layer_id TEXT PRIMARY KEY,
            boring_id TEXT NOT NULL,
            layer_index NUMERIC NOT NULL,
            name TEXT NOT NULL,
            thickness NUMERIC NOT NULL,
            FOREIGN KEY (boring_id) REFERENCES ${DB_TABLENAMES.BORINGS} ON DELETE CASCADE,
            UNIQUE (boring_id, layer_index)
        );

        CREATE TABLE ${DB_TABLENAMES.SPT_RESULTS} (
            spt_id TEXT PRIMARY KEY,
            boring_id TEXT NOT NULL,
            depth NUMERIC NOT NULL,
            hitcount NUMERIC NOT NULL,
            distance NUMERIC NOT NULL,
            FOREIGN KEY (boring_id) REFERENCES ${DB_TABLENAMES.BORINGS} ON DELETE CASCADE,
            UNIQUE (boring_id, depth)
        );

        CREATE TABLE ${DB_TABLENAMES.LAYER_COLORS} (
            name TEXT NOT NULL UNIQUE,
            color_index NUMERIC NOT NULL
        );

        CREATE TABLE ${DB_TABLENAMES.TOPOS} (
            topo_id TEXT PRIMARY KEY,
            topo_name TEXT NOT NULL UNIQUE,
            topo_type TEXT NOT NULL,
            color_index NUMERIC NOT NULL,
            three_id TEXT,
            is_batched INTEGER NOT NULL CHECK (is_batched IN (0, 1))
        );

        CREATE TABLE ${DB_TABLENAMES.TOPO_POINTS} (
            topo_id TEXT NOT NULL,
            point_index INTEGER,
            coord_x REAL NOT NULL,
            coord_y REAL NOT NULL,
            coord_z REAL NOT NULL,
            FOREIGN KEY (topo_id) REFERENCES ${DB_TABLENAMES.TOPOS} ON DELETE CASCADE,
            UNIQUE (topo_id, coord_x, coord_y, coord_z)
        );

        CREATE TABLE ${DB_TABLENAMES.TOPO_TRIANGLES} (
            topo_id TEXT NOT NULL,
            index_n INTEGER NOT NULL,
            index_i INTEGER NOT NULL,
            index_j INTEGER NOT NULL,
            FOREIGN KEY (topo_id) REFERENCES ${DB_TABLENAMES.TOPOS} ON DELETE CASCADE,
            UNIQUE (index_n, index_i, index_j)
        );

        CREATE TABLE ${DB_TABLENAMES.BOUNDARIES} (
            boundary_id TEXT PRIMARY KEY,
            three_obj_id TEXT NOT NULL UNIQUE,
            boundary_name TEXT NOT NULL,
            color_index INTEGER NOT NULL DEFAULT 1
        );

        CREATE TABLE ${DB_TABLENAMES.BOUNDARY_POINTS} (
            boundary_id TEXT NOT NULL,
            point_index INTEGER NOT NULL,
            coord_x REAL NOT NULL,
            coord_y REAL NOT NULL,
            FOREIGN KEY (boundary_id) REFERENCES ${DB_TABLENAMES.BOUNDARIES} ON DELETE CASCADE,
            UNIQUE (boundary_id, point_index)
        );
    `);

    console.log("Tables recreated");

    // Add layer trigger
    await db.exec(`
        CREATE TRIGGER insert_layer_color_if_not_exists
        AFTER INSERT ON ${DB_TABLENAMES.LAYERS}
        FOR EACH ROW
        WHEN (NEW.name IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM ${DB_TABLENAMES.LAYER_COLORS} WHERE name = NEW.name
        ))
        BEGIN
            INSERT INTO 
                ${DB_TABLENAMES.LAYER_COLORS} (name, color_index)
            VALUES
                (NEW.name, 1);
        END;
    `);

    // Remove layer trigger
    await db.exec(`
        CREATE TRIGGER delete_layer_color_if_no_layers
        AFTER DELETE ON ${DB_TABLENAMES.LAYERS}
        FOR EACH ROW
        WHEN NOT EXISTS (
            SELECT 1 FROM ${DB_TABLENAMES.LAYERS} WHERE name = OLD.name
        )
        BEGIN
            DELETE FROM ${DB_TABLENAMES.LAYER_COLORS} WHERE name = OLD.name;
        END;
    `);

    // Update trigger
    await db.exec(`
        CREATE TRIGGER update_layer_color_on_name_change
        AFTER UPDATE ON ${DB_TABLENAMES.LAYERS}
        FOR EACH ROW
        BEGIN
            -- 새로운 이름이 기존 레이어에 존재하지 않는 경우에만 색상 추가
            INSERT OR IGNORE INTO ${DB_TABLENAMES.LAYER_COLORS} (name, color_index)
            VALUES (NEW.name, 1);
    
            -- 기존 이름이 더 이상 사용되지 않으면 색상 삭제
            DELETE FROM ${DB_TABLENAMES.LAYER_COLORS}
            WHERE name = OLD.name
            AND NOT EXISTS (
                SELECT 1 FROM ${DB_TABLENAMES.LAYERS} WHERE name = OLD.name
            );
    
            -- 병합된 경우 중복된 색상 삭제
            DELETE FROM ${DB_TABLENAMES.LAYER_COLORS}
            WHERE name = NEW.name
            AND EXISTS (
                SELECT 1 FROM ${DB_TABLENAMES.LAYER_COLORS} WHERE name = OLD.name
            );
        END;
    `);

    // Restore foreign key option
    await db.run("PRAGMA foreign_keys = ON;");
}

export async function truncateDBHard(db: Database) {
    try {
        await db.run('PRAGMA foreign_keys = OFF');

        const tables = await db.all(`
            SELECT name FROM sqlite_master WHERE type='table';
        `);
        
        let i = 1;
        for (const { name } of tables) {
            console.log(`Job ${i++} : Drop Table ${name}`);
            // Remove triggers
            await db.run(`DROP TRIGGER IF EXISTS insert_layer_color_if_not_exists;`);
            await db.run(`DROP TRIGGER IF EXISTS delete_layer_color_if_no_layers;`);
            await db.run(`DROP TRIGGER IF EXISTS delete_layer_color_if_no_layers;`);
            await db.run(`DROP TABLE IF EXISTS "${name}";`);
        }

        console.log('Dropped all tables.');
    } catch (error) {
        console.error('Failed to truncate database:', error);
        throw error;
    }
}

export async function truncateDBSoft(db: Database) {
    try {
        // Turn off foreign key constrain
        await db.run('PRAGMA foreign_keys = OFF');

        // Remove triggers
        await db.run(`DROP TRIGGER IF EXISTS update_layer_color_on_name_change;`);
        await db.run(`DROP TRIGGER IF EXISTS insert_layer_color_if_not_exists;`);
        await db.run(`DROP TRIGGER IF EXISTS delete_layer_color_if_no_layers;`);

        // Import table list and remove all rows
        const tables = await db.all(`
            SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';
        `);

        for (const { name } of tables) {
            console.log(`Deleting all rows from table: ${name}`);
            await db.run(`DELETE FROM "${name}";`);
        }

        // Restore triggers
        await db.run(updateLayerTrigger);
        await db.run(insertLayerTrigger);
        await db.run(removeLayerTrigger);

        // Turn on foreign key constrain
        await db.run('PRAGMA foreign_keys = ON');
    } catch (error) {
        console.error('Failed to truncate database:', error);
        throw error;
    }
}

export async function flushData(db: Database) {
    try {

        console.log('Run Truncate');
        await db.run("PRAGMA foreign_keys = OFF;");
        
        const tables = await db.all(`
            SELECT name FROM sqlite_master WHERE type='table';
        `);
        
        await db.run('BEGIN TRANSACTION');

        for (const table of tables) {
            await db.exec(`DELETE FROM ${table.name}`);
        }

        await db.run('COMMIT');

        await db.run("PRAGMA foreign_keys = ON;");
        
    } catch (error) {
        await db.run('ROLLBACK');
        console.log(error);
    }
}