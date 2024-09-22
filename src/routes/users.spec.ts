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

describe("Route: users", () => {
  let response: any;
  describe("Happy path", () => {
    beforeEach(async () => {
      response = await server.inject({
        method: "GET",
        url: "/users",
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

  describe("URL query parameters", () => {
    it("rejects a too-high limit", async () => {
      response = await server.inject({
        method: "GET",
        url: "/users",
        headers: {
          authorization: `Bearer ${validJwt}`,
        },
        query: {
          limit: "1000",
        },
      });
      expect(response.statusCode).toEqual(400);
    });

    it("rejects a non-number limit", async () => {
      response = await server.inject({
        method: "GET",
        url: "/users",
        headers: {
          authorization: `Bearer ${validJwt}`,
        },
        query: {
          limit: "banana",
        },
      });
      expect(response.statusCode).toEqual(400);
    });

    it("rejects a non-number starting_after", async () => {
      response = await server.inject({
        method: "GET",
        url: "/users",
        headers: {
          authorization: `Bearer ${validJwt}`,
        },
        query: {
          starting_after: "banana",
        },
      });
      expect(response.statusCode).toEqual(400);
    });

    it("rejects a non-number ending_before", async () => {
      response = await server.inject({
        method: "GET",
        url: "/users",
        headers: {
          authorization: `Bearer ${validJwt}`,
        },
        query: {
          ending_before: "banana",
        },
      });
      expect(response.statusCode).toEqual(400);
    });
  });
});
