import createHttpError, { HttpError } from "http-errors";
import { NextFunction, Request, Response } from "express";
import { environment } from "../config.js";
import { MongooseError } from "mongoose";
import { formatZodErrors } from "../utils/formatZodErrors.js";
import { ZodError } from "zod";

export const httpStatusCodes = {
  CONTINUE: 100,
  SWITCHING_PROTOCOLS: 101,
  PROCESSING: 102,
  EARLY_HINTS: 103,
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NON_AUTHORITATIVE_INFORMATION: 203,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  PARTIAL_CONTENT: 206,
  MULTI_STATUS: 207,
  ALREADY_REPORTED: 208,
  IM_USED: 226,
  MULTIPLE_CHOICES: 300,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  USE_PROXY: 305,
  TEMPORARY_REDIRECT: 307,
  PERMANENT_REDIRECT: 308,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  I_AM_A_TEAPOT: 418,
  MISDIRECTED_REQUEST: 421,
  UNPROCESSABLE_ENTITY: 422,
  LOCKED: 423,
  FAILED_DEPENDENCY: 424,
  TOO_EARLY: 425,
  UPGRADE_REQUIRED: 426,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  VARIANT_ALSO_NEGOTIATES: 506,
  INSUFFICIENT_STORAGE: 507,
  LOOP_DETECTED: 508,
  NOT_EXTENDED: 510,
  NETWORK_AUTHENTICATION_REQUIRED: 511,
} as const;

export type HTTP_STATUS_KEYS = keyof typeof httpStatusCodes;
export type HTTP_STATUS_VALS =
  (typeof httpStatusCodes)[keyof typeof httpStatusCodes];

export const API_ERROR_TYPES = {
  BAD_TOKEN: "BadTokenError",
  TOKEN_EXPIRED: "TokenExpiredError",
  UNAUTHORIZED: "AuthFailureError",
  INTERNAL: "InternalError",
  NOT_FOUND: "NotFoundError",
  NO_ENTRY: "NoEntryError",
  NO_DATA: "NoDataError",
  BAD_REQUEST: "BadRequestError",
  FORBIDDEN: "ForbiddenError",
  VALIDATION_ERROR: "ValidationError",
  ZOD_VALIDATION_ERROR: "ZodValidationError",
  PAGINATION_ERROR: "PaginationError",
  RATELIMIT_ERROR: "RateLimitError",
  PAYLOAD_TOO_LARGE: "PaylodTooLarge",
  POLICY_ERROR: "PolicyError",
} as const;

export type API_ERROR_TYPE =
  (typeof API_ERROR_TYPES)[keyof typeof API_ERROR_TYPES];

// type guard for CastError
// Create a custom type guard to check for 'kind' property
function isCastError(err: any): err is MongooseError & { kind: string } {
  return err instanceof MongooseError && "kind" in err;
}

export class ApiError extends Error {
  constructor(
    public type: API_ERROR_TYPE,
    public message: string = "API Error",
  ) {
    super(type);
  }

  public static handle(err: ApiError, res: Response): Response {
    let error: HttpError;
    switch (err.type) {
      case API_ERROR_TYPES.BAD_TOKEN:
      case API_ERROR_TYPES.TOKEN_EXPIRED:
      case API_ERROR_TYPES.UNAUTHORIZED: {
        error = new createHttpError.Unauthorized(err.message);
        return res
          .status(error.status)
          .json(err.formatErrorToJSON(err.type, error));
      }
      case API_ERROR_TYPES.INTERNAL: {
        const simpleErr = err as Error;
        error = createHttpError(simpleErr);
        if (error.expose) {
          return res
            .status(error.status)
            .json(err.formatErrorToJSON(err.type, error));
        }
        error = createHttpError(error.status || 500);
        return res
          .status(error.status)
          .json(err.formatErrorToJSON(err.type, error));
      }
      case API_ERROR_TYPES.NOT_FOUND:
      case API_ERROR_TYPES.NO_ENTRY:
      case API_ERROR_TYPES.NO_DATA: {
        error = new createHttpError.NotFound(err.message);
        const errorJSON = err.formatErrorToJSON(err.type, error);
        return res.status(error.status).json(errorJSON);
      }
      case API_ERROR_TYPES.PAGINATION_ERROR:
      case API_ERROR_TYPES.VALIDATION_ERROR:
      case API_ERROR_TYPES.BAD_REQUEST: {
        error = new createHttpError.BadRequest(err.message);
        const errorJSON = err.formatErrorToJSON(err.type, error);
        return res.status(error.status).json(errorJSON);
      }
      case API_ERROR_TYPES.FORBIDDEN: {
        error = new createHttpError.Forbidden(err.message);
        return res
          .status(error.status)
          .json(err.formatErrorToJSON(err.type, error));
      }
      case API_ERROR_TYPES.RATELIMIT_ERROR: {
        error = new createHttpError.TooManyRequests(err.message);
        return res
          .status(error.status)
          .json(err.formatErrorToJSON(err.type, error));
      }
      case API_ERROR_TYPES.PAYLOAD_TOO_LARGE: {
        error = new createHttpError.PayloadTooLarge(err.message);
        return res
          .status(error.status)
          .json(err.formatErrorToJSON(err.type, error));
      }
      default: {
        let message = err.message;
        // Do not send failure message in production as it may send sensitive data
        if (environment === "production") message = "Something wrong happened.";
        error = new createHttpError.InternalServerError(message);
        return res
          .status(error.status)
          .json(err.formatErrorToJSON(err.type, error));
      }
    }
  }

  public formatErrorToJSON(
    apiErrorName: API_ERROR_TYPE,
    httpError: HttpError,
    details?: object,
  ) {
    return {
      data: null,
      error: {
        status: httpError.status,
        name: apiErrorName,
        httpErrorName: httpError.name,
        message: httpError.message,
        ...(details && { details: details }), // Conditionally include the 'details' property
        ...(httpError.stack && { stack: httpError.stack }), // Conditionally include the 'stack' property
      },
    };
  }
}

export function notFound(req: Request, res: Response, next: NextFunction) {
  throw new ApiError(
    API_ERROR_TYPES.NOT_FOUND,
    `API Endpoint Not Found: ${req.originalUrl}`,
  );
}

export default function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  err.stack = environment === "production" ? undefined : err.stack;
  if (err.name === "ZodError") {
    const { errors, message: zodMessage } = formatZodErrors(
      JSON.parse(err.message) as ZodError,
    );
    const error = new createHttpError.BadRequest(err.message);
    const apiErrorInstance = new ApiError(API_ERROR_TYPES.VALIDATION_ERROR);
    res.status(error.status).json(
      apiErrorInstance.formatErrorToJSON(apiErrorInstance.type, error, {
        errors,
      }),
    );
  }
  res.statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  err.message = err.message;
  // Use the custom type guard to check for 'kind' property
  if (isCastError(err) && err.kind === "ObjectId") {
    res.statusCode = 404;
    err.message = "Resource Not Found";
  }

  if (err instanceof ApiError) {
    ApiError.handle(err, res);
    if (err.type === API_ERROR_TYPES.INTERNAL) {
      console.error(
        `500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
      );
    }
  } else {
    console.log(err);
    console.error(
      `500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
    );
    console.error(err);
    if (environment === "development") return res.status(500).send(err);
    ApiError.handle(
      new ApiError(API_ERROR_TYPES.INTERNAL, "Internal Error"),
      res,
    );
  }
}
