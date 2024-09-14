import fp from "fastify-plugin";
import { InjectOptions } from "fastify";

import { initFastify } from "../app.js";

const server = initFastify();

vi.mock("../utils/db.js", async () => ({
  insertUsers: vi.fn(),
  getUsers: vi.fn(() => []),
}));

vi.mock("axios", async () => ({
  default: {
    get: () => new Promise(() => {}),
  },
}));

describe("Routes: ALL", () => {
  const testableRoutes: InjectOptions[] = [
    { url: "/populate", method: "POST" },
    { url: "/clerks", method: "GET" },
  ];

  for (const route of testableRoutes) {
    it(`rejects requests to ${route.url} without authorization`, async () => {
      const response = await server.inject({
        method: route.method,
        url: route.url,
      });
      const bodyParsed = JSON.parse(response.body);

      expect(response.statusCode).toEqual(400);
      expect(bodyParsed.error).toEqual("Bad Request");
    });

    it(`rejects requests to ${route.url} with malformed authorization`, async () => {
      const response = await server.inject({
        method: route.method,
        url: route.url,
        headers: {
          authorization: "INVLAID_HEADER",
        },
      });
      const bodyParsed = JSON.parse(response.body);

      expect(response.statusCode).toEqual(400);
      expect(bodyParsed.error).toEqual("Bad Request");
    });

    it(`rejects requests to ${route.url} with malformed JWT`, async () => {
      const response = await server.inject({
        method: route.method,
        url: route.url,
        headers: {
          authorization: "Bearer INVALID_JWT",
        },
      });
      const bodyParsed = JSON.parse(response.body);

      expect(response.statusCode).toEqual(401);
      expect(bodyParsed.error).toEqual("Unauthorized");
    });
  }
});
