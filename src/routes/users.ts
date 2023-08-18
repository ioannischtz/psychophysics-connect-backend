import express, { Request, Response } from "express";
import isValidReq from "../policies/isValidReq.js";
import userSchemas from "../db/models/User/user.valSchemas.js";
import asyncHandler from "express-async-handler";
import userController from "../controllers/userController.js";

const router = express.Router();

// @route    api/users/signup
// @method   POST
// @desc     Signup a new user
// @access   Public
router.post(
  "/signup",
  express.urlencoded({ limit: "2kb", parameterLimit: 4, extended: false }),
  isValidReq(userSchemas.createUserSchema),
  asyncHandler(async (req: Request, res: Response) => {
    userController.register(req, res);
    // res.status(200).json("POST: /api/users/signup");
  }),
);
// @route    api/users/login
// @method   POST
// @desc     Authenticate user & set token
// @access   Public
router.post(
  "/login",
  express.urlencoded({ limit: "1kb", parameterLimit: 2, extended: false }),
  isValidReq(userSchemas.credentialsSchema),
  (req, res) => res.status(200).json("POST: /api/users/login"),
);
// @route    api/users/logout
// @method   POST
// @desc     Logout user & remove token
// @access   Public
router.post(
  "/logout",
  (req, res) => res.status(200).json("POST: /api/users/logout"),
);
// @route    api/users/homepage
// @method   GET
// @desc     Get the user's (Role=Subject) homepage
// @access   Private: run isAuthedSubject Policy-Middleware
router.get(
  "/homepage",
  (req, res, next) => {
    console.info("Policy: isAuthedSubject()");
    next();
  },
  (req, res) => res.status(200).json("GET: /api/users/homepage"),
);
// @route    api/users/account
// @method   PUT
// @desc     Update the user's account info
// @access   Private: run isAuthedSubject Policy-Middleware
router.put(
  "/account",
  (req, res, next) => {
    console.info("Policy: isAuthedSubject()");
    next();
  },
  (req, res) => res.status(200).json("PUT: /api/users/account"),
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
  (req, res) => res.status(200).json("DELETE: /api/users/account"),
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
  (req, res) =>
    res.status(200).json(`GET: /api/users/roles/${req.params.role}`),
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
  (req, res) =>
    res.status(200).json({ msg: `GET: /api/users/roles`, q: req.query }),
);

export default router;
