import Fastify, { FastifyInstance } from "fastify";
import { initFastify } from "./app.js";

const { PORT } = process.env;
const server = initFastify({
  logger: {
    level: "info",
  },
});

try {
  const serverPort = PORT ? parseInt(PORT) : 8080;
  await server.listen({ port: serverPort, host: "0.0.0.0" });
  console.log(`Server listening at http://localhost:${serverPort}`);
} catch (err) {
  server.log.error(err);
  process.exit(1);
}
