--------------------------------------------
-- SQL table creation script
--------------------------------------------

CREATE TABLE IF NOT EXISTS "customer" (
	"id"	INTEGER NOT NULL UNIQUE,
	"name"	TEXT NOT NULL,
	"surname"	TEXT,
	"address"	TEXT,
	"active"	INTEGER NOT NULL DEFAULT 1,
	PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS "pet" (
	"id"	INTEGER NOT NULL UNIQUE,
    "cid"	INTEGER NOT NULL,
	"name"	TEXT NOT NULL,
	"breed"	TEXT NOT NULL,
	"treatments"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT),
    FOREIGN KEY("cid") REFERENCES "customer"("id")
);

CREATE TABLE IF NOT EXISTS "booking" (
	"id"	INTEGER NOT NULL UNIQUE,
	"cid"	INTEGER NOT NULL,
	"pid"	INTEGER NOT NULL,
	"from"	TEXT NOT NULL,
	"to"	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("pid") REFERENCES "pet"("id"),
	FOREIGN KEY("cid") REFERENCES "customer"("id")
);
