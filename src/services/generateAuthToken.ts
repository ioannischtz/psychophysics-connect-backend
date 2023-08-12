import jwt from "jsonwebtoken";
import { User } from "../db/models/User/user.valSchemas.js";
import { jwtSecret, jwtValiditySecs } from "../config.js";

export type UserWithId = Required<Pick<User, "_id">> & Omit<User, "_id">;

export default function generateAuthToken(user: UserWithId): string {
  const token = jwt.sign({ _id: user._id.toString() }, jwtSecret, {
    expiresIn: jwtValiditySecs, // Set the token expiration time as needed
  });
  return token;
}
