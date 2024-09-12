import axios from "axios";
import { FastifyPluginCallback } from "fastify";

import { isAuthorized } from "../handlers/is-authorized.js";

////
/// Types
//

interface ClerksUser {
  registeredDate: string;
  registeredUnixTime: number;
  name: string;
  email: string;
  phone: string;
  picture: string;
}

////
/// Constants
//

// TODO: Conver to shared schema with /populate
// https://fastify.dev/docs/v4.21.x/Reference/Validation-and-Serialization/#adding-a-shared-schema
const routeOptions = {
  schema: {
    response: {
      default: {
        type: "object",
        properties: {
          message: {
            type: "string",
          },
          error: {
            type: "string",
          },
          users: {
            type: "array",
            items: {
              registeredDate: {
                type: "string",
              },
              registeredUnixTime: {
                type: "integer",
              },
              name: {
                type: "string",
              },
              email: {
                type: "string",
              },
              phone: {
                type: "string",
              },
              picture: {
                type: "string",
              },
            },
          },
        },
      },
    },
    headers: {
      type: "object",
      properties: {
        Authorization: { type: "string" },
      },
      required: ["Authorization"],
    },
  },
  preHandler: [isAuthorized("read:users")],
};

////
/// Exports
//

const routes: FastifyPluginCallback = async (server) => {
  server.get("/clerks", routeOptions, (request, reply) => {
    let users: ClerksUser[] = [];
    try {
      const query = request.database.select();
      users = query.all() as ClerksUser[];
    } catch (error: any) {
      request.log.error(`Clerks: error getting users - ${error.message}`);
      return reply.code(500).send({ error: "Error getting users ..." });
    }

    reply.code(200).send({ users });
  });
};

export default routes;
