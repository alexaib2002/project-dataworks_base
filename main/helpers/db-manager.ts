/**
 * Helper intended for DB management.
 * Supplies the necessary methods for storing and querying data
 */

import { open } from 'sqlite';
import sqlite from 'sqlite3';
import fs from 'fs';

const DbPath = 'data.db';
const DbDir = './db';
const DbData = DbDir.concat('/data');
const DbTable = DbDir.concat('/tables');

const protectedTables = ['user', 'sqlite_sequence'];

let db: any;
let dbFirstRun: boolean = false;

/**
 * Executes SQL scripts in a specified directory.
 *
 * @param {string} where - The directory path containing SQL scripts to execute.
 */

const executeSQLDir = async (where: string) => {
    for (const file of fs.readdirSync(where)) {
        console.log("About to execute SQL script", file);
        if (!file.endsWith('.sql')) continue;
        const sql = fs.readFileSync(`${where}/${file}`, 'utf8');
        await db.exec(sql).then(() => {
            console.log(`Sucessfully executed SQL script ${file}`);
        }).catch((err: any) => {
            console.error(`Error while executing SQL script ${file}`);
            console.error(err);
        });
    }
};

/**
 * Initializes the system tables.
 */

const initSystemStruct = async () => {
    console.log("About to create/upgrade system tables");
    db.exec(`CREATE TABLE IF NOT EXISTS "user" (
        "uid"	INTEGER NOT NULL UNIQUE,
        "username"	TEXT NOT NULL UNIQUE,
        "password"	TEXT NOT NULL,
        PRIMARY KEY("uid" AUTOINCREMENT)
    )`).then(() => {
        console.log('Sucessfully created/updated system table users');
    }).catch((err: any) => {
        console.log(err);
    });
};

/**
 * Initializes the application tables.
 */

const initAppStruct = async () => {
    console.log("About to create/upgrade app tables");
    executeSQLDir(DbTable);
};

/**
 * Initializes the application data.
 */

const initAppData = async () => {
    console.log("About to create/upgrade app data");
    if (dbFirstRun)
        executeSQLDir(DbData);
};

/**
 * Probes if the database is being run for the first time.
 *
 * @param {string} path - The path to the database file.
 */

const probeFirstRun = async (path: string) => {
    if (!fs.existsSync(DbDir)) fs.mkdirSync(DbDir);
    if (!fs.existsSync(DbTable)) fs.mkdirSync(DbTable);
    if (!fs.existsSync(DbData)) fs.mkdirSync(DbData);
    if (!fs.existsSync(path)) dbFirstRun = true;
};

/**
 * Initializes the database.
 */

export const initDb = async () => {
    const { app } = require('electron');
    const DbQualifiedPath = `${app.getPath('userData')}/${DbPath}`;
    probeFirstRun(DbQualifiedPath);
    db = await open({
        filename: DbQualifiedPath,
        driver: sqlite.Database
    });
    initSystemStruct();
    initAppStruct();
    initAppData();
};

/**
 * Closes the database.
 */

export const closeDb = async () => {
    await db.close();
};

/**
 * Retrieves the names of all tables in the database.
 *
 * @returns {Promise<string[]>} An array of table names.
 */

export const getTables = async () => {
    const tables = await db.all(`SELECT name FROM sqlite_master WHERE type='table'`);
    return tables.map((table: any) => table.name)
        .filter((table: string) => !protectedTables.includes(table));
};

/**
 * Retrieves the columns of a specified table.
 *
 * @param {string} table - The name of the table.
 * @returns {Promise<any[]>} An array of column information.
 */

export const getCols = async (table: string) => {
    const cols = await db.all(`PRAGMA table_info(${table})`);
    return cols;
};

/**
 * Retrieves the registry data from a specified table.
 *
 * @param {string} table - The name of the table.
 * @param {string[]} [cols=[]] - An optional array of column names to select.
 * @param {object[]} [where=[]] - An optional array of filter conditions.
 * @param {boolean} [all=false] - Determines whether to retrieve all matching records or only the first.
 * @returns {Promise<any[]>} An array of registry data.
 */

export const getRegistry = async (table: string, cols: string[] = [], where: object[] = [], all: boolean = false) => {
    const query = `SELECT ${(
        () => cols.length > 0 ? cols.join(',') : '*')()
        } FROM ${table}${(() => {
            let stmt: string = "";
            if (where.length > 0) {
                stmt += ' WHERE ';
                where.forEach((w: any) => {
                    stmt += `${w.what} LIKE ?`;
                });
            }
            return stmt;
        })()};`;
    return all ?
        await db.all(query, <string[]>where.map((w: any) => w.filter)) :
        await db.get(query, <string[]>where.map((w: any) => w.filter));;
};

/**
 * Retrieves the foreign key information of a specified column.
 *
 * @param {string} table - The name of the table.
 * @param {string} col - The name of the column.
 * @returns {Promise<any[]>} An array of foreign key information.
 */

export const getForeignKey = async (table: string, col: string) => {
    const query = `PRAGMA foreign_key_list(${table})`;
    const fks = await db.all(query);
    return fks.filter((fk: any) => fk.from === col)[0];
};

/**
 * Inserts a full registry into a specified table.
 *
 * @param {string} table - The name of the table.
 * @param {string[]} values - An array of values to insert.
 * @returns {Promise<void>} A Promise that resolves when the insert operation is complete.
 */

export const insertFullRegistry = async (table: string, values: string[]) => {
    const query = `INSERT INTO ${table} VALUES (${(() => {
        let qvals: string = "";
        values.forEach((_: string) => { qvals += "?,"; })
        return qvals.slice(0, -1);
    })()});`;
    return db.run(query, ...values);
};

/**
 * Inserts a registry into a specified table with specified columns.
 *
 * @param {string} table - The name of the table.
 * @param {string[]} cols - An array of column names.
 * @param {string[]} values - An array of values to insert.
 * @returns {Promise<void>} A Promise that resolves when the insert operation is complete.
 */

export const insertRegistry = async (table: string, cols: string[], values: string[]) => {
    const query = `INSERT INTO ${table}(${cols.join(',')}) VALUES (${(() => {
        let qvals: string = "";
        values.forEach((_: string) => { qvals += "?,"; })
        return qvals.slice(0, -1);
    })()});`;
    return db.run(query, values);
};

/**
 * Updates a registry in a specified table based on filter conditions.
 *
 * @param {string} table - The name of the table.
 * @param {string[]} cols - An array of column names to update.
 * @param {string[]} values - An array of new values for the columns.
 * @param {object[]} where - An array of filter conditions.
 * @returns {Promise<void>} A Promise that resolves when the update operation is complete.
 */

export const updateRegistry = async (table: string, cols: string[], values: string[], where: object[]) => {
    const query = `UPDATE ${table} SET ${(() => {
        let stmt: string = "";
        cols.forEach((col: string) => {
            stmt += `${col} = ?,`;
        });
        return stmt.slice(0, -1);
    })()} WHERE ${(() => {
        let stmt: string = "";
        where.forEach((w: any) => {
            stmt += `${w.what} LIKE ?`;
        });
        return stmt;
    })()};`;
    return db.run(query, [...values, ...<string[]>where.map((w: any) => w.filter)]);
};
