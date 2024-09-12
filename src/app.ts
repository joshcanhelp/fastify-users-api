import Fastify, { FastifyInstance, FastifyServerOptions } from "fastify";

import homeRoute from "./routes/home.js";
import populateRoute from "./routes/populate.js";

export const initFastify = (options: FastifyServerOptions = {}) => {
  const server: FastifyInstance = Fastify(options);
  server.register(homeRoute);
  server.register(populateRoute);
  return server;
};