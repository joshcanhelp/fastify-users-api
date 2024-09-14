import fp from "fastify-plugin";

import { initFastify } from "../app.js";
import { makeJwt, validClients } from "../utils/jwt.js";
import { insertUsers, getUsers } from "../utils/db.js";

const server = initFastify();

vi.mock("../utils/db.js", async () => ({
  getUsers: vi.fn(() => []),
}));

vi.mock("axios", async () => ({
  default: {
    get: () => new Promise(() => {}),
  },
}));

vi.stubEnv("TOKEN_SIGNING_KEY", "STUBBED_TOKEN_SIGNING_KEY");

const validJwt = await makeJwt(
  validClients[Math.round(Math.random())],
  ["read:users"],
  "STUBBED_TOKEN_SIGNING_KEY",
);

describe("Route: clerks", () => {
  it("returns users with successful authorization", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/clerks",
      headers: {
        authorization: `Bearer ${validJwt}`,
      },
    });

    const bodyParsed = JSON.parse(response.body);

    expect(response.statusCode).toEqual(200);
    expect(bodyParsed).toEqual({ users: [] });
  });
});
