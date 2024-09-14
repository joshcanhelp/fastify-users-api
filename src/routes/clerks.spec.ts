import { initFastify } from "../app.js";
import { makeJwt, validClients } from "../utils/jwt.js";

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
  let response: any;
  beforeEach(async () => {
    response = await server.inject({
      method: "GET",
      url: "/clerks",
      headers: {
        authorization: `Bearer ${validJwt}`,
      },
    });
  });

  it("responds 200 with correct authorization", async () => {
    expect(response.statusCode).toEqual(200);
  });

  it("does not include an error with correct authorization", async () => {
    const bodyParsed = JSON.parse(response.body);
    expect(bodyParsed).toEqual({ users: [] });
  });
});
