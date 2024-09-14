import { initFastify } from "../app.js";
import { makeJwt, validClients } from "../utils/jwt.js";

const server = initFastify();

vi.mock("../utils/db.js", async () => ({
  insertUsers: vi.fn(),
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
  it("seeds users with successful authorization", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/populate",
      headers: {
        authorization: `Bearer ${validJwt}`,
      },
    });

    const bodyParsed = JSON.parse(response.body);

    expect(response.statusCode).toEqual(200);
    expect(bodyParsed.error).toBeFalsy();
  });
});
