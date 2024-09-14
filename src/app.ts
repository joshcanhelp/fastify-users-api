import Fastify, { FastifyInstance, FastifyServerOptions } from "fastify";

import homeRoute from "./routes/home.js";
import populateRoute from "./routes/populate.js";
import clerksRoute from "./routes/clerks.js";

export const initFastify = (options: FastifyServerOptions = {}) => {
  const server: FastifyInstance = Fastify(options);
  server.register(homeRoute);
  server.register(populateRoute);
  server.register(clerksRoute);
  return server;
};
