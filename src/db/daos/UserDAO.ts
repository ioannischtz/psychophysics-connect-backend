import { Types } from "mongoose";
import { UserModel } from "../models/User/UserModel.js";
import { User } from "../models/User/user.valSchemas.js";

type UserQueryOptions = Pick<User, "role" | "username">;
type UserFieldOptions = (keyof Partial<User>)[];

function isFieldObjectID(
  field: Types.ObjectId | string,
): field is Types.ObjectId {
  return (field as Types.ObjectId)._id !== undefined;
}

// ---------------
// ---- Single ----
// ---------------

async function userExists(field: Types.ObjectId | string): Promise<boolean> {
  const user = isFieldObjectID(field)
    ? await UserModel.exists({ _id: field })
    : await UserModel.exists({ email: field });

  return user !== null && user !== undefined;
}

// Private: return private info(email, role) excluding password
async function findPrivateById(id: Types.ObjectId): Promise<User | null> {
  return UserModel.findOne({ _id: id }).select("+email +role").exec();
}
// lean version
async function findPrivateByIdLean(id: Types.ObjectId): Promise<User | null> {
  return UserModel.findOne({ _id: id })
    .select("+email +role")
    .lean<User>()
    .exec();
}

// Public: return public info (no password, email, role)
async function findPublicById(id: Types.ObjectId): Promise<User | null> {
  return UserModel.findOne({ _id: id }).exec();
}
// lean version
async function findPublicByIdLean(id: Types.ObjectId): Promise<User | null> {
  return UserModel.findOne({ _id: id }).lean().exec();
}

// Return critical info
async function findWithCriticalById(id: Types.ObjectId): Promise<User | null> {
  return UserModel.findOne({ _id: id }).select("+email +password +role").exec();
}
// lean version
async function findWithCriticalByIdLean(
  id: Types.ObjectId,
): Promise<User | null> {
  return UserModel.findOne({ _id: id })
    .select("+email +password +role")
    .lean()
    .exec();
}

// Return critical info
async function findWithCriticalByEmail(email: string): Promise<User | null> {
  return UserModel.findOne({ email: email })
    .select("+email +password +role")
    .exec();
}
// lean version
async function findWithCriticalByEmailLean(
  email: string,
): Promise<User | null> {
  return UserModel.findOne({ email: email })
    .select("+email +password +role")
    .lean()
    .exec();
}

async function findFieldsById(
  id: Types.ObjectId,
  ...fields: UserFieldOptions
): Promise<User | null> {
  return UserModel.findOne({ _id: id }, [...fields]).exec();
}
// lean version
async function findFieldsByIdLean(
  id: Types.ObjectId,
  ...fields: UserFieldOptions
): Promise<User | null> {
  return UserModel.findOne({ _id: id }, [...fields])
    .lean()
    .exec();
}

async function create(user: User): Promise<User> {
  const newUser = await UserModel.create(user);
  return newUser.toObject();
}

async function update(user: User): Promise<User> {
  await UserModel.updateOne({ _id: user._id }, { $set: { ...user } })
    .lean()
    .exec();
  return user;
}

async function deleteById(id: Types.ObjectId): Promise<boolean> {
  const deleted = await UserModel.findOneAndDelete({ _id: id }).lean().exec();
  return !!deleted;
}

// ---------------
// ---- Many -----
// ---------------

async function findManyByRole(role: Pick<User, "role">): Promise<User[]> {
  return UserModel.find({ role }).exec();
}
// lean version
async function findManyByRoleLean(role: Pick<User, "role">): Promise<User[]> {
  return UserModel.find({ role }).lean().exec();
}

async function findManyByQuery(queryOpts: UserQueryOptions): Promise<User[]> {
  const query = UserModel.find();

  if (queryOpts.username) {
    query.where("username").equals(queryOpts.username);
  }

  if (queryOpts.role) {
    query.where("role").equals(queryOpts.role);
  }

  const users = await query.exec();
  return users;
}
// lean version
async function findManyByQueryLean(
  queryOpts: UserQueryOptions,
): Promise<User[]> {
  const query = UserModel.find();

  if (queryOpts.username) {
    query.where("username").equals(queryOpts.username);
  }

  if (queryOpts.role) {
    query.where("role").equals(queryOpts.role);
  }

  const users = await query.lean().exec();
  return users;
}
