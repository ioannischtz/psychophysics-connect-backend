import { Types } from "mongoose";
import { UserModel } from "../models/User/UserModel.js";

function isFieldObjectID(
  field: Types.ObjectId | string,
): field is Types.ObjectId {
  return (field as Types.ObjectId)._id !== undefined;
}

async function userExists(field: Types.ObjectId | string): Promise<boolean> {
  const user = isFieldObjectID(field)
    ? await UserModel.exists({ _id: field })
    : await UserModel.exists({ email: field });

  return user !== null && user !== undefined;
}
