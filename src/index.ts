import Fastify, { FastifyInstance } from "fastify";

import homeRoute from "./routes/home.js";
import populateRoute from "./routes/populate.js";

const { PORT } = process.env;
const server: FastifyInstance = Fastify({
  logger: {
    level: "info",
  },
});

server.register(homeRoute);
server.register(populateRoute);

try {
  const serverPort = PORT ? parseInt(PORT) : 8080;
  await server.listen({ port: serverPort, host: "0.0.0.0" });
  console.log(`Server listening at http://localhost:${serverPort}`);
} catch (err) {
  server.log.error(err);
  process.exit(1);
}
