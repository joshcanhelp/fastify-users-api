import { FastifyPluginCallback } from "fastify";

export const routes: FastifyPluginCallback = async (server, options) => {
  server.get("/", async (request, reply) => {
    return "OK";
  });
};

export default routes;