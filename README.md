# Clerks API

## Getting Started

```bash
$ npm ci
$ npm run build
$ echo "PORT=7777" > .env
$ npm start
Server listening at http://localhost:7777
$ curl http://localhost:7777
OK
```

## Routes

All routes except the home route require authorization using a JWT in an `Authorization` header. These tokens can be minted using `scripts/make-jwt.js`. 

```bash
$ node ./scripts/make-jwt.js VALID_CLIENT_ID populate:users
```

- First argument requires a valid client ID, found in `src/utils/jwt.ts`
- Second argument is a comma-separated list of scopes

### `POST /populate`

This endpoint requires an access token with a `populate:users` scope.

```bash
$ npm start
$ curl -X POST -H "Authorization: Bearer $(\
  node ./scripts/make-jwt.js VALID_CLIENT_ID populate:users \
  )" http://localhost:7777/populate
```

## `GET /clerks`

This endpoint requires an access token with a `read:users` scope.

```bash
$ npm start
$ curl -X POST -H "Authorization: Bearer $(\
  node ./scripts/make-jwt.js VALID_CLIENT_ID read:users \
  )" http://localhost:7777/clerks
```


## Contribution

```bash
$ npm run dev
$ npm run pretter-watch
$ npm run test-watch
```