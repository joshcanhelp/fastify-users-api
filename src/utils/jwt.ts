import * as jose from "jose";

////
/// Types
//

export interface AccessTokenPayload {
  scope: string;
  client_id: string;
  sub: string;
  exp: number;
  [key: string]: string | number;
}

////
/// Constants
//

const validAudience = "https://user-api.clerk.com";
const validIssuer = "https://auth.clerk.com";

////
/// Exports
//

export const validClients: string[] = [
  "4e6925fa05f4f999cba014f8a50ef486",
  "8955da6ef1f3dc940b66eab59d114c86",
];

export const verifyJwt = async (
  jwt: string,
  tokenSigningKey: string,
): Promise<AccessTokenPayload> => {
  const secret = new TextEncoder().encode(tokenSigningKey);

  // https://github.com/panva/jose/blob/main/docs/functions/jwt_verify.jwtVerify.md
  const { payload } = await jose.jwtVerify(jwt, secret, {
    algorithms: ["HS256"],
    issuer: validIssuer,
    audience: validAudience,
  });

  // Required claims for JWT-formatted access tokens
  // https://datatracker.ietf.org/doc/html/rfc9068#name-data-structure

  if (!payload.sub || !validClients.includes(payload.sub)) {
    throw new Error('unexpected "sub" claim');
  }

  if (!payload.client_id || payload.client_id !== payload.sub) {
    throw new Error('unexpected "client_id" claim');
  }

  if (!payload.hasOwnProperty("scope") || !payload.scope) {
    throw new Error('unexpected "scope" claim');
  }

  return payload as AccessTokenPayload;
};

export const makeJwt = async (
  subject: string,
  scopes: string[],
  secret: string,
) => {
  const encodedSecret = new TextEncoder().encode(secret);

  // https://github.com/panva/jose/blob/main/docs/classes/jwt_sign.SignJWT.md
  return await new jose.SignJWT({ client_id: subject, scope: scopes.join(" ") })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(validIssuer)
    .setAudience(validAudience)
    .setSubject(subject)
    .setExpirationTime("2h")
    .sign(encodedSecret);
};
