import { Request } from "express";
import { User } from "../db/models/User/user.valSchemas.js";

export interface JwtCookie {
  jwt: string;
}

export interface ProtectedRequest extends Request {
  user: User;
  cookies: JwtCookie;
}
