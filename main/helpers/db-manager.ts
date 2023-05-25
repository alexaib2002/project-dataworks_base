/**
 * Helper intended for DB management. 
 * Supplies the necessary methods for storing and querying data
 */

const DbPath = 'data.db';

import { open } from 'sqlite';
import sqlite, { Database } from 'sqlite3';

let db: any;

export const initDb = async () => {
    const { app } = require('electron');
    const path = require('path');
    const DbQualifiedPath = path.join(app.getPath('userData'), DbPath);
    db = await open({
        filename: DbQualifiedPath,
        driver: sqlite.Database
    });
    initStruct();
};

export const initStruct = async () => {
    db.exec(`CREATE TABLE IF NOT EXISTS "user" (
        "uid"	INTEGER NOT NULL UNIQUE,
        "username"	TEXT NOT NULL UNIQUE,
        "password"	TEXT NOT NULL,
        PRIMARY KEY("uid" AUTOINCREMENT)
    )`).then(() => {
        console.log('Created table users');
    }).catch((err: any) => {
        console.log(err);
    });
};

export const closeDb = async () => {
    await db.close();
};

export const getCols = async (table: string) => {
    const cols = await db.all(`PRAGMA table_info(${table})`);
    return cols.map((col) => col.name);
};

export const getRegistry = async (table: string, cols: string[], where: object[]) => {
    const query = `SELECT ${cols.join(',')} FROM ${table}${(() => {
            let stmt: string = "";
            if (where.length > 0) {
                stmt += ' WHERE ';
                where.forEach((w: any) => {
                    stmt += `${w.what} LIKE ?`;
                });
            }
            return stmt;
        })()};`;
    console.log(query);
    return await db.get(query, <string[]> where.map((w: any) => w.filter));
};

export const insertFullRegistry = async (table: string, values: string[]) => {
    const query = `INSERT INTO ${table}(${await getCols(table)}) VALUES (${(() => {
        let qvals: string = "";
        values.forEach((_: string) => { qvals += "?,"; })
        return qvals.slice(0, -1);
    })()});`;
    return db.exec(query, values);
};