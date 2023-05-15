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
};

export const closeDb = async () => {
    await db.close();
};

export const getCols = async (table: string) => {
    const cols = await db.all(`PRAGMA table_info(${table})`);
    return cols.map((col) => col.name);
};

export const insertFullRegistry = async (table: string, values: string[]) => {
    const query = `INSERT INTO ${table}(${await getCols(table)}) VALUES (${
        (() => {
            let qvals: string = "";
            values.forEach((_: string) => {qvals += "?,";})
            return qvals.slice(0, -1);
        })()}`.concat(");");
    console.log(query);
    db.run(query, values);
};
