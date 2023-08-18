import express, { CookieOptions, Request, Response } from "express";
import isValidReq from "../policies/isValidReq.js";
import userSchemas from "../db/models/User/user.valSchemas.js";
import asyncHandler from "express-async-handler";
import userController from "../controllers/userController.js";
import createSession from "../middleware/session.js";
import { environment, jwtSecret } from "../config.js";
import experimentController from "../controllers/experimentController.js";

const router = express.Router();

const defaultSessionConfig = {
  key: "user.sess",
  cookieOpts: {
    httpOnly: true,
    maxAge: 86400000,
    secure: environment === "production",
    signed: true, // Important: enable signed cookies,
    sameSite: "strict",
  } as CookieOptions,
  secret: jwtSecret, // Use the jwtSecret from ../config.js
};

router.use(createSession(defaultSessionConfig));

// @route    api/users/signup
// @method   POST
// @desc     Signup a new user
// @access   Public
router.post(
  "/signup",
  express.urlencoded({ limit: "2kb", parameterLimit: 4, extended: false }),
  isValidReq(userSchemas.createUserSchema),
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

// @route    api/users/homepage
// @method   GET
// @desc     Get the user's (Role=Subject) homepage
// @access   Private: run isAuthedSubject Policy-Middleware
// router.get(
//   "/homepage",
//   (req, res, next) => {
//     console.info("Policy: isAuthedSubject()");
//     next();
//   },
//   asyncHandler(async (req: Request, res: Response) => {
//     await experimentController.listActiveExperiments(req, res);
//   }),
// );

// @route    api/users/account
// @method   PUT
// @desc     Update the user's account info
// @access   Private: run isAuthedSubject Policy-Middleware
router.put(
  "/account",
  express.urlencoded({ limit: "1kb", parameterLimit: 4, extended: false }),
  (req, res, next) => {
    console.info("Policy: isAuthedSubject()");
    next();
  },
  asyncHandler(userController.updateAccountInfo),
);

// @route    api/users/account
// @method   DELETE
// @desc     Delete the user's account info
// @access   Private: run isAuthedSubject Policy-Middleware
router.delete(
  "/account",
  (req, res, next) => {
    console.info("Policy: isAuthedSubject()");
    next();
  },
  asyncHandler(userController.deleteAccount),
);

// @route    api/users/roles/:role
// @method   GET
// @desc     Get users by role
// @access   Private: run isAuthedSubject Policy-Middleware
router.get(
  "/roles/:role",
  (req, res, next) => {
    console.info("Policy: isAuthedSubject()");
    next();
  },
  asyncHandler(userController.getUsersByRole),
);

// @route    api/users
// @method   GET
// @desc     Get users by query
// @access   Private: run isAuthedSubject Policy-Middleware
router.get(
  "/",
  (req, res, next) => {
    console.info("Policy: isAuthedSubject()");
    next();
  },
  asyncHandler(userController.getUsersByQuery),
);

export default router;
