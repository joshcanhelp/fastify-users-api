import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { DatabaseSync } from "node:sqlite";
import * as path from "path";

declare module "fastify" {
  interface FastifyRequest {
    database: DatabaseSync;
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

  fastify.decorateRequest("database", { getter: () => database });
};

export default fp(sqlite, "4.x");
