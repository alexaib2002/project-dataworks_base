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

const initAppStruct = async () => {
    console.log("About to create/upgrade app tables");
    executeSQLDir(DbTable);
};

const initAppData = async () => {
    console.log("About to create/upgrade app data");
    if (dbFirstRun)
        executeSQLDir(DbData);
};

const probeFirstRun = async (path: string) => {
    if (!fs.existsSync(DbDir)) fs.mkdirSync(DbDir);
    if (!fs.existsSync(DbTable)) fs.mkdirSync(DbTable);
    if (!fs.existsSync(DbData)) fs.mkdirSync(DbData);
    if (!fs.existsSync(path)) dbFirstRun = true;
};

export const initDb = async () => {
    const { app } = require('electron');
    const DbQualifiedPath = `${app.getPath('userData')}/${DbPath})`;
    probeFirstRun(DbQualifiedPath);
    db = await open({
        filename: DbQualifiedPath,
        driver: sqlite.Database
    });
    initSystemStruct();
    initAppStruct();
    initAppData();
};

export const initSystemStruct = async () => {
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

export const closeDb = async () => {
    await db.close();
};

export const getTables = async () => {
    const tables = await db.all(`SELECT name FROM sqlite_master WHERE type='table'`);
    return tables.map((table: any) => table.name)
        .filter((table: string) => !protectedTables.includes(table));
};

export const getCols = async (table: string) => {
    const cols = await db.all(`PRAGMA table_info(${table})`);
    return cols;
};

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

export const insertFullRegistry = async (table: string, values: string[]) => {
    const query = `INSERT INTO ${table}(${await getCols(table)}) VALUES (${(() => {
        let qvals: string = "";
        values.forEach((_: string) => { qvals += "?,"; })
        return qvals.slice(0, -1);
    })()});`;
    return db.run(query, values);
};

export const insertRegistry = async (table: string, cols: string[], values: string[]) => {
    const query = `INSERT INTO ${table}(${cols.join(',')}) VALUES (${(() => {
        let qvals: string = "";
        values.forEach((_: string) => { qvals += "?,"; })
        return qvals.slice(0, -1);
    })()});`;
    return db.run(query, values);
};
