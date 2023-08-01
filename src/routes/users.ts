import express from "express";
import isValidReq from "../policies/isValidReq.js";
import userSchemas from "../db/models/User/user.valSchemas.js";

const router = express.Router();

// @route    api/users/signup
// @method   POST
// @desc     Signup a new user
// @access   Public
router.post(
  "/signup",
  express.urlencoded({ limit: "2kb", parameterLimit: 4 }),
  isValidReq(userSchemas.createUserSchema),
  (req, res) => res.status(200).json("POST: /api/users/signup"),
);
// @route    api/users/login
// @method   POST
// @desc     Authenticate user & set token
// @access   Public
router.post(
  "/login",
  express.urlencoded({ limit: "1kb", parameterLimit: 2 }),
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

export default router;
