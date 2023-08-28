import express from "express";
import isValidReq from "../policies/isValidReq.js";
import userSchemas from "../db/models/User/user.valSchemas.js";
import asyncHandler from "express-async-handler";
import userController from "../controllers/userController.js";
import isAuthed, {
  isAuthedExperimenter,
  isAuthedSubject,
} from "../policies/isAuthed.js";

const router = express.Router();

// @route    api/users/signup
// @method   POST
// @desc     Signup a new user
// @access   Public
const createUserSchema = userSchemas.createUserSchema
  .pick({
    username: true,
    email: true,
    password: true,
    role: true,
  })
  .required();
router.post(
  "/signup",
  express.urlencoded({ limit: "2kb", parameterLimit: 4, extended: false }),
  isValidReq(createUserSchema),
  asyncHandler(userController.register),
);

// @route    api/users/login
// @method   POST
// @desc     Authenticate user & set token
// @access   Public
router.post(
  "/login",
  express.urlencoded({ limit: "1kb", parameterLimit: 2, extended: false }),
  isValidReq(userSchemas.credentialsSchema),
  asyncHandler(userController.login),
);

// @route    api/users/logout
// @method   POST
// @desc     Logout user & remove token
// @access   Public
router.post("/logout", asyncHandler(userController.logout));

// @route    api/users/profile
// @method   GET
// @desc     Get the user's (Role=Subject) homepage
// @access   Private: run isAuthedSubject Policy-Middleware
router.get(
  "/profile",
  asyncHandler(isAuthedSubject),
  asyncHandler(userController.getProfile),
);

// @route    api/users/account
// @method   PUT
// @desc     Update the user's account info
// @access   Private: run isAuthed Policy-Middleware
router.put(
  "/account",
  express.urlencoded({ limit: "1kb", parameterLimit: 4, extended: false }),
  asyncHandler(isAuthed),
  asyncHandler(userController.updateAccountInfo),
);

// @route    api/users/account
// @method   DELETE
// @desc     Delete the user's account info
// @access   Private: run isAuthed Policy-Middleware
router.delete(
  "/account",
  asyncHandler(isAuthed),
  asyncHandler(userController.deleteAccount),
);

// @route    api/users/roles/:role
// @method   GET
// @desc     Get users by role
// @access   Private: run isAuthedExperimenter Policy-Middleware
router.get(
  "/roles/:role",
  asyncHandler(isAuthedExperimenter),
  asyncHandler(userController.getUsersByRole),
);

// @route    api/users
// @method   GET
// @desc     Get users by query
// @access   Private: run isAuthedExperimenter Policy-Middleware
router.get(
  "/",
  asyncHandler(isAuthedExperimenter),
  asyncHandler(userController.getUsersByQuery),
);

export default router;
