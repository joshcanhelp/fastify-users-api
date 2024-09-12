import { FastifyReply, FastifyRequest } from "fastify";

import { AccessTokenPayload, verifyJwt } from "../utils/jwt.js";

const { TOKEN_SIGNING_KEY = "" } = process.env;

export const isAuthorized = (scope: string | string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const { authorization } = request.headers;
    const authHeaderParts = authorization!.split(" ");

    if (authHeaderParts[0] !== "Bearer" || !authHeaderParts[1]) {
      reply.code(400);
      throw new Error("Invalid authorization header format");
    }

    let tokenPayload: AccessTokenPayload;
    try {
      tokenPayload = await verifyJwt(authHeaderParts[1], TOKEN_SIGNING_KEY);
    } catch (error: any) {
      reply.code(401);
      request.log.error(
        `Authorization: Token could not be verified: ${error.message}`,
      );
      throw new Error("Invalid authorization token");
    }

    const tokenScopes = (tokenPayload.scope! as string).split(" ");
    const requiredScopes = typeof scope === "string" ? [scope] : scope;
    for (const scope of requiredScopes) {
      if (!tokenScopes.includes(scope)) {
        request.log.error(
          `Authorization: Scope ${scope} not found in ${tokenScopes}`,
        );
        reply.code(401);
        throw new Error("Invalid authorization token");
      }
    }
  };
};
