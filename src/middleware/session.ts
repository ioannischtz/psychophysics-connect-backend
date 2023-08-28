import { CookieOptions, NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import { deepmerge } from "deepmerge-ts";
import { environment, jwtSecret } from "../config.js";

export type SessionData = Record<string, any>;

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

const createSession = (config?: any) => {
  const mergedConfig = deepmerge(defaultSessionConfig, config || {});

  const cookieParserMiddleware = cookieParser(mergedConfig.secret);

  const sessionHandler = (req: Request, res: Response, next: NextFunction) => {
    if (!req.signedCookies[mergedConfig.key]) {
      // Create a new session
      req.sessionData = {};
    } else {
      // Existing session, parse and load data
      try {
        req.sessionData = JSON.parse(req.signedCookies[mergedConfig.key]);
      } catch (err) {
        console.error("Error parsing session data:", err);
        req.sessionData = {};
      }
    }

    // Add a function to res to save session data
    res.setSessionData = (data?: SessionData | null) => {
      req.sessionData = data;
      if (data) {
        res.cookie(
          mergedConfig.key,
          JSON.stringify(data),
          mergedConfig.cookieOpts,
        );
      } else {
        res.clearCookie(mergedConfig.key);
      }
    };

    next();
  };

  return [cookieParserMiddleware, sessionHandler];
};

export default createSession;
