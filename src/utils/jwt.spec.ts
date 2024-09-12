import * as jose from "jose";

import { verifyJwt, makeJwt, validClients } from "./jwt.js";

const validJwtPayload = {
  iss: "https://auth.clerk.com",
  aud: "https://user-api.clerk.com",
  sub: "4e6925fa05f4f999cba014f8a50ef486",
  client_id: "4e6925fa05f4f999cba014f8a50ef486",
};

const signingSecret = "JWT_SIGNING_KEY";

describe("Util: jwt", () => {
  let randomValidClient = "";

  beforeEach(() => {
    randomValidClient = validClients[Math.round(Math.random())];
  });

  describe("Function: verifyJwt", () => {
    it("verifies a valid JWT", async () => {
      const validJwt = await makeJwt(
        randomValidClient,
        ["scope1", "scope2"],
        signingSecret,
      );
      const payload = await verifyJwt(validJwt, signingSecret);
      expect(payload).toMatchObject({
        client_id: randomValidClient,
        scope: "scope1 scope2",
        iss: "https://auth.clerk.com",
        aud: "https://user-api.clerk.com",
        sub: randomValidClient,
      });
    });

    it("fails verification with incorrect secret", async () => {
      const invalidJwt = await makeJwt(
        randomValidClient,
        [],
        "INVALID_SIGNING_SECRET",
      );
      expect(
        async () => await verifyJwt(invalidJwt, signingSecret),
      ).rejects.toThrowError(/signature verification/);
    });

    it("fails verification with no scopes", async () => {
      const invalidJwt = await makeJwt(randomValidClient, [], signingSecret);
      expect(
        async () => await verifyJwt(invalidJwt, signingSecret),
      ).rejects.toThrowError(/"scope" claim/);
    });

    it("fails verification with invalid subject", async () => {
      const invalidJwt = await makeJwt("INVALID_CLIENT_ID", [], signingSecret);
      expect(
        async () => await verifyJwt(invalidJwt, signingSecret),
      ).rejects.toThrowError(/"sub" claim/);
    });

    it("fails verification with invalid client_id", async () => {
      const invalidJwt = await new jose.SignJWT({
        client_id: "INVALID_CLIENT_ID",
        scope: "scope",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuer(validJwtPayload.iss)
        .setAudience(validJwtPayload.aud)
        .setSubject(randomValidClient)
        .setExpirationTime("2h")
        .sign(new TextEncoder().encode(signingSecret));

      expect(
        async () => await verifyJwt(invalidJwt, signingSecret),
      ).rejects.toThrowError(/"client_id" claim/);
    });

    it("fails verification with unsupported algorithm", async () => {
      const invalidJwt = await new jose.SignJWT({
        client_id: randomValidClient,
        scope: "scope",
      })
        .setProtectedHeader({ alg: "HS512" })
        .setIssuer(validJwtPayload.iss)
        .setAudience(validJwtPayload.aud)
        .setSubject(randomValidClient)
        .setExpirationTime("2h")
        .sign(new TextEncoder().encode(signingSecret));

      expect(
        async () => await verifyJwt(invalidJwt, signingSecret),
      ).rejects.toThrowError(/"alg"/);
    });

    it("fails verification with invalid audience", async () => {
      const invalidJwt = await new jose.SignJWT({
        client_id: randomValidClient,
        scope: "scope",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuer(validJwtPayload.iss)
        .setAudience("INVALID_AUDIENCE")
        .setSubject(randomValidClient)
        .setExpirationTime("2h")
        .sign(new TextEncoder().encode(signingSecret));

      expect(
        async () => await verifyJwt(invalidJwt, signingSecret),
      ).rejects.toThrowError(/unexpected "aud" claim/);
    });

    it("fails verification with invalid issuer", async () => {
      const invalidJwt = await new jose.SignJWT({
        client_id: randomValidClient,
        scope: "scope",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuer("INVALID_AUDIENCE")
        .setAudience(validJwtPayload.aud)
        .setSubject(randomValidClient)
        .setExpirationTime("2h")
        .sign(new TextEncoder().encode(signingSecret));

      expect(
        async () => await verifyJwt(invalidJwt, signingSecret),
      ).rejects.toThrowError(/unexpected "iss" claim/);
    });
  });
});
