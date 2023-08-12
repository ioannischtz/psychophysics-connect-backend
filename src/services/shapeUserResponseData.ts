import { User } from "../db/models/User/user.valSchemas.js";

export type ShapedUserResponseData = {
  userData: Omit<User, "password">;
  msg: string;
};

function shapeUserResponseData(
  user: User,
  msg: string,
): ShapedUserResponseData {
  const { _id, username, email, role, createdAt, updatedAt } = user;
  return {
    userData: { _id, username, email, role, createdAt, updatedAt },
    msg: msg,
  };
}

export default shapeUserResponseData;
