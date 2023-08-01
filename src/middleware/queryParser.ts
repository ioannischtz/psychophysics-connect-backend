import { NextFunction, Request, Response } from "express";
import { ParsedQs } from "qs";
import { deepmerge } from "deepmerge-ts";
import qs from "qs";
import { Middleware } from "middleware.js";

type QueryCache = Record<string, ParsedQs | string | string[]>;

declare global {
  namespace Express {
    interface Request {
      queryCache: QueryCache;
    }
  }
}

const defaults = {
  strictNullHandling: true,
  arrayLimit: 100,
  depth: 20,
};

const queryParser = (settings?: qs.IParseOptions): Middleware => {
  return (req: Request, res: Response, next: NextFunction) => {
    const qstr = req.url.split("?")[1] || "";
    req.queryCache = req.queryCache || {};

    if (!req.queryCache[qstr]) {
      const mergedSettings = deepmerge(defaults, settings || {});
      req.queryCache[qstr] = qs.parse(qstr, mergedSettings) as ParsedQs; // Use type assertion
    }

    req.query = req.queryCache[qstr];

    next();
  };
};

export default queryParser;
