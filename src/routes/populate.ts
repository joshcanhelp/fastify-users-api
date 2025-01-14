import axios from "axios";
import { FastifyPluginCallback } from "fastify";

import { isAuthorized } from "../handlers/is-authorized.js";
import { getUserCount, insertUsers } from "../utils/db.js";

////
/// Types
//

export interface RandomUser {
  registered: {
    date: string;
  };
  name: {
    title: string;
    first: string;
    last: string;
  };
  email: string;
  phone: string;
  picture: {
    large: string;
  };
}

interface RandomUserApiResponse {
  results: RandomUser[];
  info: {
    results: number;
  };
}

////
/// Constants
//

let inProgress = false;
const populateUsersCount = 5000;

// TODO: Convert to shared schema with /users route
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
  preHandler: [isAuthorized("populate:users")],
};

////
/// Exports
//

const routes: FastifyPluginCallback = async (server) => {
  server.post("/users/populate", routeOptions, (request, reply) => {
    // We don't want to start another populate process while one is still going.
    if (inProgress) {
      return reply.code(200).send({
        message: "Populate is in progress, please try again later...",
      });
    }

    const userCount = getUserCount();
    if (userCount > 1000000) {
      return reply.code(409).send({
        error: "User count is greater than 1,000,000 ...",
      });
    }

    inProgress = true;

    // https://randomuser.me/documentation
    const apiUrl = new URL("https://randomuser.me/api/");
    apiUrl.searchParams.set("results", `${populateUsersCount}`);
    const incFields = ["name", "email", "phone", "registered", "picture"];
    apiUrl.searchParams.set("inc", incFields.join(","));

    axios
      .get(apiUrl.toString())
      .then((response) => {
        const userResults = response.data as RandomUserApiResponse;

        try {
          insertUsers(userResults.results);
          request.log.info(`Populate: saved ${userResults.info.results}`);
        } catch (error: any) {
          request.log.error(`Populate: error saving users - ${error.message}`);
        }
      })
      .catch((error) => {
        request.log.error(
          `Populate: error ${error.message} with status ${error.response.status}`,
        );
      })
      .finally(() => {
        inProgress = false;
      });

    reply.code(200).send({
      message: "Users are being added now...",
    });
  });
};

export default routes;
