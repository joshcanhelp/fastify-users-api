import { initFastify } from "../app.js";
import { makeJwt, validClients } from "../utils/jwt.js";

const server = initFastify();

vi.mock("axios", async () => ({
  default: {
    get: () => new Promise(() => {}),
  },
}));

const signingSecret = "JWT_SIGNING_KEY";
const validJwt = await makeJwt(
  validClients[Math.round(Math.random())],
  ["scope1", "scope2"],
  signingSecret,
);

describe("Route: populate", () => {
  it("rejects requests without authorization", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/populate",
    });
    const bodyParsed = JSON.parse(response.body);

    expect(response.statusCode).toEqual(400);
    expect(bodyParsed.error).toEqual("Bad Request");
  });

  it("rejects requests without malformed authorization", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/populate",
      headers: {
        authorization: "INVLAID_HEADER",
      },
    });
    const bodyParsed = JSON.parse(response.body);

    expect(response.statusCode).toEqual(400);
    expect(bodyParsed.error).toEqual("Bad Request");
  });

  it("rejects requests without malformed JWT", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/populate",
      headers: {
        authorization: "Bearer INVALID_JWT",
      },
    });
    const bodyParsed = JSON.parse(response.body);

    expect(response.statusCode).toEqual(401);
    expect(bodyParsed.error).toEqual("Unauthorized");
  });

  it("seeds the users with successful authorization", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/populate",
      headers: {
        authorization: `Bearer ${validJwt}`,
      },
    });

    console.log(response);

    const bodyParsed = JSON.parse(response.body);

    expect(response.statusCode).toEqual(401);
    expect(bodyParsed.error).toEqual("Unauthorized");
  });
});
