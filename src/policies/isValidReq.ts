import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { AnyZodObject, z, ZodEffects } from "zod";

const VALIDATION_SOURCE = {
  BODY: "body",
  HEADER: "header",
  QUERY: "query",
  PARAMS: "params",
} as const;
export type VALIDATION_SOURCE =
  (typeof VALIDATION_SOURCE)[keyof typeof VALIDATION_SOURCE];

export function isValidObjectId() {
  return z.string().refine((value: string) => Types.ObjectId.isValid(value), {
    message: "Invalid Object Id",
  });
}

export function isValidEndpoint() {
  return z.string().refine(
    (value) => {
      if (!value.includes("://")) return false;
      try {
        new URL(value);
        return true;
      } catch (error) {
        return false;
      }
    },
    {
      message: "Invalid URL Endpoint: It should include '://'",
    },
  );
}

export function isValidAuthBearer() {
  return z.string().refine(
    (value: string) => {
      const parts = value.split(" ");
      return parts.length === 2 && parts[0] === "Bearer" && parts[1] !== "";
    },
    {
      message:
        "Invalid Authorization Header: It should be in the format 'Bearer <token>'",
    },
  );
}

function isValidReq(
  schema: AnyZodObject,
  validationSource: VALIDATION_SOURCE = VALIDATION_SOURCE.BODY,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req[validationSource]);
      next();
    } catch (error: any) {
      console.error(error);
      return res.status(400).send(error.erros);
    }
  };
}

export default isValidReq;
