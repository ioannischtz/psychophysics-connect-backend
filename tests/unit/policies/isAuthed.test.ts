import { beforeEach, describe, expect, it, vi } from "vitest";
import { API_ERROR_TYPES, ApiError } from "../../../src/middleware/errors.js";
import {
  isAuthedExperimenter,
  isAuthedSubject,
} from "../../../src/policies/isAuthed.js";
import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import UserDAO from "../../../src/db/daos/UserDAO.js";
import { User } from "../../../src/db/models/User/user.valSchemas.js";
import { Types } from "mongoose";
import generateAuthToken from "../../../src/services/generateAuthToken.js";

vi.mock("../../../src/middleware/logger.ts", () => {
  return {
    default: {
      info: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    },
  };
});

// vi.mock("jsonwebtoken", async (actual) => {
//   const jwt = await actual();
//   return {
//     //@ts-ignore
//     ...jwt,
//     verify: () => ({
//       _id: "id",
//     }),
//   };
// });

describe("isAuthed Middleware", () => {
  let mockRequest: Request;
  let mockResponse: Response;
  let mockNext: () => void;

  beforeEach(() => {
    mockRequest = {
      signedCookies: {
        "user.sess": JSON.stringify({
          token: generateAuthToken({
            _id: new Types.ObjectId(),
            role: "experimenter",
          }),
        }),
      },
    } as Request;
    mockResponse = {} as Response;
    mockNext = vi.fn();
  });

  describe("isAuthedSubject middleware", () => {
    it("should pass for valid token and subject role", async () => {
      const req = mockRequest;
      const res = mockResponse;
      const next = mockNext;
      const mockUser: User = {
        _id: new Types.ObjectId(),
        role: "subject",
        username: "Subject user",
        email: "subject@user.com",
      };

      vi.spyOn(jwt, "verify").mockImplementation(() => ({ _id: mockUser._id }));

      vi.spyOn(UserDAO, "findPrivateByIdLean").mockResolvedValueOnce(mockUser);

      await isAuthedSubject(req, res, next);

      expect(req.sessionData._id).toBe(mockUser._id);
      expect(next).toBeCalled();
    });

    it("should throw an error for invalid role", async () => {
      const req = mockRequest;
      const res = mockResponse;
      const next = mockNext;
      const mockUser: User = {
        _id: new Types.ObjectId(),
        role: "experimenter",
        username: "Experimenter user",
        email: "experimenter@user.com",
      };

      vi.spyOn(jwt, "verify").mockImplementation(() => ({ _id: mockUser._id }));

      vi.spyOn(UserDAO, "findPrivateByIdLean").mockResolvedValueOnce(mockUser);
      try {
        await isAuthedSubject(req, res, next);
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).type).toBe(API_ERROR_TYPES.FORBIDDEN);
        expect((error as ApiError).message).toBe(
          "Access forbidden, role does not match",
        );
      }
    });

    it("should throw an error for invalid token", async () => {
      const req = {
        ...mockRequest,
        signedCookies: {
          "user.sess": JSON.stringify({
            token: "invalid_token",
          }),
        },
      } as Request;
      const res = mockResponse;
      const next = mockNext;
      const mockUser: User = {
        _id: new Types.ObjectId(),
        role: "experimenter",
        username: "Subject user",
        email: "subject@user.com",
      };

      vi.spyOn(UserDAO, "findPrivateByIdLean").mockResolvedValueOnce(mockUser);
      try {
        await isAuthedSubject(req, res, next);
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).type).toBe(API_ERROR_TYPES.UNAUTHORIZED);
        expect((error as ApiError).message).toBe(
          "Not Authorized, token failed",
        );
      }
    });

    it("should throw an error if token doesn't exist", async () => {
      const req = {
        ...mockRequest,
        signedCookies: {
          "user.sess": JSON.stringify({
            token: undefined,
          }),
        },
      } as Request;
      const res = mockResponse;
      const next = mockNext;
      const mockUser: User = {
        _id: new Types.ObjectId(),
        role: "experimenter",
        username: "Subject user",
        email: "subject@user.com",
      };

      try {
        await isAuthedSubject(req, res, next);
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).type).toBe(API_ERROR_TYPES.UNAUTHORIZED);
        expect((error as ApiError).message).toBe("Not Authorized, no token");
      }
    });
  });

  // Similar tests can be written for isAuthedExperimenter middleware
});
