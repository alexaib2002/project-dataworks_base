
--------------------------------------------
-- SQL initial data script
--------------------------------------------

-- Run insertions only for non-existing data
-- This allows the script to be run multiple times without duplicating data
-- Do not initialize the id field nor the active field, as the DB will do that for us

BEGIN TRANSACTION;

SELECT "Initializing customer table";

INSERT INTO "customer" ("name","surname","address") VALUES ('John','Smith','1 Main Street');
INSERT INTO "customer" ("name","surname","address") VALUES ('Jane','Smith','1 Main Street');
INSERT INTO "customer" ("name","surname","address") VALUES ('Fred','Jones','2 Main Street');
INSERT INTO "customer" ("name","surname","address") VALUES ('Mary','Jones','2 Main Street');

SELECT "Initializing pet table";

INSERT INTO "pet" ("cid","name","breed","treatments") VALUES (1,'Fido','Dog','Flea treatment');
INSERT INTO "pet" ("cid","name","breed","treatments") VALUES (1,'Rover','Dog','Flea treatment');
INSERT INTO "pet" ("cid","name","breed","treatments") VALUES (2,'Mittens','Cat','Flea treatment');
INSERT INTO "pet" ("cid","name","breed","treatments") VALUES (3,'Spot','Dog','Flea treatment');
INSERT INTO "pet" ("cid","name","breed","treatments") VALUES (4,'Fluffy','Cat','Flea treatment');

SELECT "Initializing booking table";

INSERT INTO "booking" ("cid","pid","from","to") VALUES (1,1,'2019-01-01','2019-01-07');
INSERT INTO "booking" ("cid","pid","from","to") VALUES (1,2,'2019-01-01','2019-01-07');
INSERT INTO "booking" ("cid","pid","from","to") VALUES (2,3,'2019-01-01','2019-01-07');
INSERT INTO "booking" ("cid","pid","from","to") VALUES (3,4,'2019-01-01','2019-01-07');
INSERT INTO "booking" ("cid","pid","from","to") VALUES (4,5,'2019-01-01','2019-01-07');

COMMIT TRANSACTION;
