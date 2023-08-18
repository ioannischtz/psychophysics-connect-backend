import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import UserDAO from "../db/daos/UserDAO.js";
import {
  API_ERROR_TYPES,
  ApiError,
  httpStatusCodes,
} from "../middleware/errors.js";
import logger from "../middleware/logger.js";
import { Types } from "mongoose";
import generateAuthToken, {
  UserWithId,
} from "../services/generateAuthToken.js";
import shapeUserResponseData from "../services/shapeUserResponseData.js";
import { ShapedUserResponseData } from "../services/shapeUserResponseData.js";
import { User } from "../db/models/User/user.valSchemas.js";
import { sanitizeUserQuery } from "../services/sanitizeQuery.js";

export type UserResData = Pick<ShapedUserResponseData, "userData">;

async function register(req: Request, res: Response): Promise<void> {
  const { username, email, password, role } = req.body;

  // Check if user already exists
  const isExistingUser = await UserDAO.userExists(email);
  if (isExistingUser) {
    throw new ApiError(API_ERROR_TYPES.BAD_REQUEST, "User already exists");
  }

  // Create new user
  const newUser = await UserDAO.create({
    _id: new Types.ObjectId(),
    username,
    email,
    password: await bcrypt.hash(password, 10), // Password hashing is automatically handled by pre-save hook
    role,
  });

  if (!newUser) {
    throw new ApiError(API_ERROR_TYPES.VALIDATION_ERROR, "Invalid user data");
  }

  // Generate JWT token using the generateAuthToken service
  const token = generateAuthToken(newUser as UserWithId);

  // Call the shapeUserResponseData service
  const userResponseData = shapeUserResponseData(
    newUser as UserWithId,
    "User registered successfully:",
  );

  // Save the token in the session data
  res.setSessionData({
    ...userResponseData,
    token,
  });

  logger.info(userResponseData.msg, userResponseData.userData);
  res.status(httpStatusCodes.CREATED).json(userResponseData);
}

async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  // find the user by email
  const user = await UserDAO.findWithCriticalByEmailLean(email);

  // Check if a user with the provided email exists
  if (!user) {
    throw new ApiError(API_ERROR_TYPES.NOT_FOUND, "User not found");
  }

  // Check the validity of the provided password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(API_ERROR_TYPES.UNAUTHORIZED, "Invalid credentials");
  }

  // Generate JWT token using the generateAuthToken service
  const token = generateAuthToken(user as UserWithId);

  // Save the token in the session data
  res.setSessionData({
    _id: user._id,
    username: user.username,
    role: user.role,
    email: user.email,
    token,
  });

  // Call the shapeUserResponseData service
  const userResponseData = shapeUserResponseData(
    user as UserWithId,
    "Login successful",
  ) as ShapedUserResponseData;

  logger.info(userResponseData.msg, userResponseData.userData);

  // Retun success response
  res.status(httpStatusCodes.OK).json(userResponseData);
}

async function logout(req: Request, res: Response): Promise<void> {
  // Clear the user's session data by setting it to an empty object
  res.setSessionData({});

  const responseData = {
    msg: "Logout successful",
  };

  logger.info(responseData.msg);

  // Send a response message indicating the successful logout
  res.status(httpStatusCodes.OK).json(responseData);
}

async function getProfile(req: Request, res: Response): Promise<void> {
  // Assuming the user's _id has been set in the session data during login
  const userId = req.sessionData._id;
  if (!userId) {
    throw new ApiError(API_ERROR_TYPES.UNAUTHORIZED, "User ID not found");
  }

  // fetch user date
  const user = await UserDAO.findPublicByIdLean(userId);

  if (!user) {
    // User not found
    throw new ApiError(API_ERROR_TYPES.NOT_FOUND, "User not found");
  }

  // Call the shapeUserResponseData service
  const userResponseData = shapeUserResponseData(
    user as UserWithId,
    "Profile fetched successfully",
  ) as ShapedUserResponseData;

  logger.info(userResponseData.msg, userResponseData.userData);

  // return the fetched user data
  res.status(httpStatusCodes.OK).json(userResponseData);
}

async function updateAccountInfo(req: Request, res: Response): Promise<void> {
  const userId = req.sessionData._id; // Retrieve userId from sessionData

  if (!userId) {
    throw new ApiError(API_ERROR_TYPES.UNAUTHORIZED, "User ID not found");
  }

  const existingUser = await UserDAO.findPrivateByIdLean(userId);
  if (!existingUser) {
    throw new ApiError(API_ERROR_TYPES.NOT_FOUND, "User not registered");
  }

  // Update fields if provided in the request body
  if (req.body.username) {
    existingUser.username = req.body.username;
  }
  if (req.body.email) {
    existingUser.email = req.body.email;
  }
  if (req.body.password) {
    existingUser.password = await bcrypt.hash(req.body.password, 10);
  }

  await UserDAO.update(existingUser);

  // Shape the user response data
  const userResponseData = shapeUserResponseData(
    existingUser,
    "Profile updated successfully",
  );

  logger.info(userResponseData.msg, userResponseData.userData);

  res.status(httpStatusCodes.OK).json(userResponseData);
}

async function deleteAccount(req: Request, res: Response): Promise<void> {
  const userId = req.sessionData._id;
  if (!userId) {
    throw new ApiError(API_ERROR_TYPES.UNAUTHORIZED, "User not logged in");
  }

  // Delete the user account
  const didDelete: boolean = await UserDAO.deleteById(userId);

  if (!didDelete) {
    throw new ApiError(API_ERROR_TYPES.NOT_FOUND, "User not registered");
  }

  const responseData = {
    msg: "Account deleted successfully",
  };

  logger.info(responseData.msg);

  res.status(httpStatusCodes.OK).json(responseData);
}

async function getUsersByRole(req: Request, res: Response): Promise<void> {
  type UserRole = Pick<User, "role">["role"];
  const role = req.params.role as unknown as UserRole; // Extract the role from the request parameters

  if (!role || (role !== "subject" && role !== "experimenter")) {
    throw new ApiError(API_ERROR_TYPES.BAD_REQUEST, "Invalid role");
  }

  // Retrieve users based on role
  const users: User[] = await UserDAO.findManyByRoleLean(role as UserRole);

  const responseData = {
    msg: `Fetched users by role: ${role} successfully`,
    users,
  };

  logger.info(responseData.msg, responseData.users);

  res.status(httpStatusCodes.OK).json(responseData);
}

async function getUsersByQuery(req: Request, res: Response): Promise<void> {
  const sanitizedQuery = sanitizeUserQuery(req.query); // Sanitize and validate query parameters

  const users = await UserDAO.findManyByQueryLean(sanitizedQuery);

  const responseData = {
    msg: `Fetched users by query: ${
      JSON.stringify(
        sanitizedQuery,
      )
    } successfully`,
    users,
  };

  logger.info(responseData.msg, responseData.users);

  res.status(httpStatusCodes.OK).json(responseData);
}

export default {
  register,
  login,
  logout,
  getProfile,
  updateAccountInfo,
  deleteAccount,
  getUsersByRole,
  getUsersByQuery,
};
