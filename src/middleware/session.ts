import { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import { deepmerge } from "deepmerge-ts";
import { environment, jwtSecret } from "../config.js";

type SessionData = Record<string, any>;

declare global {
  namespace Express {
    interface Request {
      sessionData: SessionData;
    }
    interface Response {
      setSessionData(data: SessionData): void;
    }
  }
}

const defaultSessionConfig = {
  key: "user.sess",
  maxAge: 86400000,
  autoCommit: true,
  overwrite: true,
  httpOnly: true,
  signed: true, // Important: enable signed cookies
  rolling: false,
  renew: false,
  secure: environment === "production", // Use the environment variable
  sameSite: null,
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
    res.setSessionData = (data: SessionData) => {
      req.sessionData = data;
      res.cookie(mergedConfig.key, JSON.stringify(data), mergedConfig.cookie);
    };

    next();
  };

  return [cookieParserMiddleware, sessionHandler];
};

export default createSession;