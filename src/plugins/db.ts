import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { DatabaseSync, StatementSync } from "node:sqlite";
import * as path from "path";

declare module "fastify" {
  interface FastifyRequest {
    database: {
      insert: () => StatementSync;
      select: () => StatementSync;
    };
  }
}

const sqlite: FastifyPluginAsync = async (fastify) => {
  const { NODE_ENV, DB_FILE_LOCATION = "" } = process.env;
  const environment = NODE_ENV ? NODE_ENV : "development";
  const database = new DatabaseSync(path.join(DB_FILE_LOCATION, environment));

  // This only fires when the application is being started
  database.exec(`
    CREATE TABLE IF NOT EXISTS 
    user_data(
      id INTEGER PRIMARY KEY,
      registeredDate TEXT,
      registeredUnixTime INTEGER,
      name TEXT,
      email TEXT,
      phone TEXT,
      picture TEXT
    ) STRICT
  `);

  const dbInterface = {
    insert: () =>
      database.prepare(
        `INSERT INTO user_data (
          registeredDate, 
          registeredUnixTime, 
          name, 
          email, 
          phone, 
          picture
        )
        VALUES (?, ?, ?, ?, ?, ?)`,
      ),
    select: () => database.prepare(`SELECT * FROM user_data`),
  };

  fastify.decorateRequest("database", { getter: () => dbInterface });
};

export default fp(sqlite, "4.x");
