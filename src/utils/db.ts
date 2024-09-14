import * as path from "node:path";
import { DatabaseSync } from "node:sqlite";

import { RandomUser } from "../routes/populate.js";
import { ClerksRouteQuery, ClerksUser } from "../routes/clerks.js";

////
/// Constants
//

const { NODE_ENV, DB_FILE_LOCATION = "" } = process.env;

const environment = NODE_ENV ? NODE_ENV : "development";
const database = new DatabaseSync(path.join(DB_FILE_LOCATION, environment));

database.exec(`
    CREATE TABLE IF NOT EXISTS 
    user_data(
      id INTEGER PRIMARY KEY,
      registeredDate TEXT,
      registeredUnixTime INTEGER,
      name TEXT,
      email TEXT,
      phone TEXT,
      picture TEXT
    ) STRICT
  `);

////
/// Exports
//

// TODO: Mock sqlite and test
export const insertUsers = (users: RandomUser[]) => {
  const insertStatement = database.prepare(
    `INSERT INTO user_data (
        registeredDate, 
        registeredUnixTime, 
        name, 
        email, 
        phone, 
        picture
      )
      VALUES (?, ?, ?, ?, ?, ?)`,
  );
  for (const user of users) {
    insertStatement.run(
      user.registered.date,
      new Date(user.registered.date).getTime(),
      user.name.title + " " + user.name.first + " " + user.name.last,
      user.email,
      user.phone,
      user.picture.large,
    );
  }
};

// TODO: Mock sqlite and test
export const getUsers = (options: ClerksRouteQuery) => {
  const {
    limit,
    email,
    starting_after: startingAfter,
    ending_before: endingBefore,
  } = options;

  let queryString = "SELECT * FROM user_data";
  let hasWhere = false;

  if (email) {
    queryString += ` WHERE email = '${email}'`;
    hasWhere = true;
  }

  if (startingAfter) {
    queryString += ` ${hasWhere ? "AND" : "WHERE"} registeredUnixTime > ${startingAfter}`;
    hasWhere = true;
  }

  if (endingBefore) {
    queryString += ` ${hasWhere ? "AND" : "WHERE"} registeredUnixTime < ${endingBefore}`;
  }

  queryString += " ORDER BY registeredUnixTime DESC";

  if (limit) {
    queryString += ` LIMIT ${limit}`;
  }

  const selectStatement = database.prepare(queryString);
  return selectStatement.all() as ClerksUser[];
};

export const getUserCount = () => {
  return (
    database.prepare("SELECT count(*) AS total FROM user_data").all()[0] as {
      total: number;
    }
  ).total;
};
