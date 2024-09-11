import { FastifyPluginCallback } from "fastify";

export const homeHandler = async () => {
  return "OK";
};

export const routes: FastifyPluginCallback = async (server, options) => {
  server.get("/", homeHandler);
};

export default routes;
