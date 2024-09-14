# Clerks API

## Getting Started

Basic first steps:

```bash
$ npm ci
$ npm run build
```

### Running locally

To run locally, make sure you have Node 22.x installed and then:

```bash
$ node --version
v22.8.0
$ touch .env
$ echo "PORT=7777" >> .env
$ echo "\nTOKEN_SIGNING_KEY=\"$(openssl rand -hex 16)\"" >> .env
$ echo "DB_FILE_LOCATION=\"$(pwd)/db\"" >> .env
$ npm start
Server listening at http://localhost:7777
$ curl http://localhost:7777
OK
```

### Running in Docker

Start Docker desktop and then:

```bash
$ docker-compose up
$ curl http://localhost:4444
OK
```

## Routes

All routes except the home route require authorization using a JWT in an `Authorization` header. A JWT-formatted access token has the benefit of allowing scoped API access for specific clients without exposing the secret. 

Acces tokens can be minted using `scripts/make-jwt.js`:

```bash
$ node --env-file=.env ./scripts/make-jwt.js VALID_CLIENT_ID action:entity
```

- First argument requires a valid client ID, found in `src/utils/jwt.ts`
- Second argument is a comma-separated list of scopes

### `POST /populate`

This endpoint requires an access token with a `populate:users` scope.

```bash
$ npm start
$ curl -X POST -H "Authorization: Bearer $(\
  node --env-file=.env ./scripts/make-jwt.js VALID_CLIENT_ID populate:users \
  )" http://localhost:7777/populate
```

The endpoint will not allow concurrent populate requests and will limit the total number of users in the system to ~1,000,000.

### `GET /clerks`

This endpoint requires an access token with a `read:users` scope.

```bash
$ npm start
$ curl -X GET -H "Authorization: Bearer $(\
  node --env-file=.env ./scripts/make-jwt.js VALID_CLIENT_ID read:users \
  )" http://localhost:7777/clerks
```

The following query parameters are allowed:

- `limit` - number between 1 and 100
- `email` - specific email address to return
- `ending_before` - Filter to get users registered earlier than a certain time, expressed in milliseconds since Unix epoch 
- `starting_after` - Filter to get users registered later than a certain time, expressed in milliseconds since Unix epoch  

## Contribution

Run the following in separate terminals/tabs:

```bash
$ npm run dev
$ npm run prettier-watch
$ npm run test-watch
```

## TODO and notes

There are a few `TODO` tasks in the code, which can be found like so:

```bash
$ grep '// TODO:' -r -n --exclude-dir={node_modules,.git,dist,db} 
```

These tasks are called out because they need to be done but not within the scope of this project. I'm happy to discuss why these were left out of the assessment and how I could go about addressing them.

A few other notes:

- Tests are intentionally light since they were taking a fair amount of time to get the mocking correct with Fastify. I added, hopefully, enough to show you that I do know how to test things!
- The assessment instructions for the `starting_after` and `ending_before` parameters on the `/clerks` route said to use a user ID as the pagination cursor. We're storing the registration date as a Unix time code (including milliseconds) and it seemed like a more useful cursor than the user ID, since you'll have the whole user record returned. Happy to refactor that as instructed if that's not acceptable. 
