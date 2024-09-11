import axios from "axios";
import { FastifyPluginCallback } from "fastify";

////
/// Types
//

interface RandomUser {
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
// TODO: Increase to 5000
const populateUsersCount = 1000;

const routeOptions = {
  schema: {
    response: {
      default: {
        type: "object",
        properties: {
          result: {
            type: "string",
          },
        },
      },
    },
  },
};

////
/// Exports
//

const routes: FastifyPluginCallback = async (server) => {
  server.post("/populate", (request, reply) => {
    // We don't want to start another populate process while one is still going.
    if (inProgress) {
      return reply.code(200).send({
        result: "Populate is in progress, please try again later...",
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

        // TODO: Save to DB

        request.log.info(`Populate: got ${userResults.info.results}`);
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
      result: "Users are being added now...",
    });
  });
};

export default routes;
