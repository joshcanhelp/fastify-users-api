import { makeJwt, validClients } from "../dist/utils/jwt.js"

if (!process.argv[2]) {
  console.log("Missing client ID argument");
  process.exit(1);
}

if (!validClients.includes(process.argv[2])) {
  console.log("Unauthorized client ID");
  process.exit(1);
}

if (!process.argv[3]) {
  console.log("Missing scope argument");
  process.exit(1);
}

console.log(await makeJwt(
  process.argv[2],
  process.argv[3].split(","),
  process.env.TOKEN_SIGNING_KEY,
));