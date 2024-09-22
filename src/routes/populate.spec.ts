import { initFastify } from "../app.js";
import { makeJwt, validClients } from "../utils/jwt.js";

const server = initFastify();

vi.mock("../utils/db.js", async () => ({
  insertUsers: vi.fn(),
  getUserCount: vi.fn(() => 5000),
}));

vi.mock("axios", async () => ({
  default: {
    get: () => new Promise(() => ({ results: [], info: {} })),
  },
}));

vi.stubEnv("TOKEN_SIGNING_KEY", "STUBBED_TOKEN_SIGNING_KEY");

const validJwt = await makeJwt(
  validClients[Math.round(Math.random())],
  ["populate:users"],
  "STUBBED_TOKEN_SIGNING_KEY",
);

// TODO: Test for successful API request completion and error
describe("Route: populate", () => {
  let response: any;
  beforeEach(async () => {
    response = await server.inject({
      method: "POST",
      url: "/users/populate",
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
    expect(bodyParsed.error).toBeFalsy();
  });
});
