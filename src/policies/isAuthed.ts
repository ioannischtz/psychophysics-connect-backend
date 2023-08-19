import { NextFunction, Request } from "express";
import jwt from "jsonwebtoken";
import { User } from "../db/models/User/user.valSchemas.js";
import { API_ERROR_TYPES, ApiError } from "../middleware/errors.js";
import logger from "../middleware/logger.js";
import { jwtSecret } from "../config.js";
import { UserModel } from "../db/models/User/UserModel.js";
import UserDAO from "../db/daos/UserDAO.js";
import { Types } from "mongoose";

// export interface Token{
//   token: string;
// }

export interface ProtectedRequest extends Request {
  user: Pick<User, "_id" | "username" | "email" | "role">;
  token: string;
}

type UserRoles = Pick<User, "role">["role"];

function generateIsAuthedWithRole(role?: UserRoles | undefined) {
  return async function isAuthedWithRole(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const userSessCookie = JSON.parse(req.signedCookies["user.sess"]);
    const token = userSessCookie["token"];

    if (!token) {
      throw new ApiError(
        API_ERROR_TYPES.UNAUTHORIZED,
        "Not Authorized, no token",
      );
    }

    try {
      const decoded = <jwt.UserIDJwtPayload> jwt.verify(token, jwtSecret);
      const user = await UserDAO.findPrivateByIdLean(
        new Types.ObjectId(decoded._id),
      );
      if (!user) {
        throw new ApiError(
          API_ERROR_TYPES.NOT_FOUND,
          `User with id:${decoded._id} not found`,
        );
      }
      logger.info(user);

      if (role !== undefined && user.role !== role) {
        logger.info(`${role + " " + user.role}`);
        throw new ApiError(
          API_ERROR_TYPES.FORBIDDEN,
          "Access forbidden, role does not match",
        );
      }

      req.sessionData._id = user._id;
      req.sessionData.username = user.username;
      req.sessionData.email = user.email;
      req.sessionData.role = user.role;

      next();
    } catch (error) {
      logger.error(error);
      throw new ApiError(
        API_ERROR_TYPES.UNAUTHORIZED,
        "Not Authorized, token failed",
      );
    }
  };
}

export const isAuthedSubject = generateIsAuthedWithRole("subject");
export const isAuthedExperimenter = generateIsAuthedWithRole("experimenter");
export default generateIsAuthedWithRole();
