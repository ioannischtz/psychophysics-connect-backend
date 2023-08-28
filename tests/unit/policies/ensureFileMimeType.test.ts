import { beforeEach, describe, expect, it, vi } from "vitest";
import { API_ERROR_TYPES, ApiError } from "../../../src/middleware/errors.js";
import { Request, Response } from "express";
import {
  ensureAudioMIMEtype,
  ensureImageMIMEtype,
  ensureTextMIMEtype,
} from "../../../src/policies/ensureFileMimeType.js";

describe("Media MIME Type Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Response;
  let mockNext: () => void;

  beforeEach(() => {
    mockRequest = {
      file: {
        mimetype: "",
        filename: "test-file.txt",
      },
      files: [
        {
          mimetype: "audio/mpeg",
          filename: "audio-file.mp3",
        },
        {
          mimetype: "image/png",
          filename: "image-file.png",
        },
      ],
    } as Partial<Request>;
    mockResponse = {} as Response;
    mockNext = vi.fn();
  });

  describe("ensureAudioMIMEtype", () => {
    it("should pass for valid audio mimetype", async () => {
      const req = {
        ...mockRequest,
        file: { mimetype: "audio/mpeg", filename: "audio-file.mp3" },
        files: undefined,
      } as Request;
      const res = mockResponse;
      const next = mockNext;

      await ensureAudioMIMEtype(req, res, next);

      expect(next).toBeCalled();
    });

    it("should pass for array of valid audio mimetype files", async () => {
      const req = {
        ...mockRequest,
        file: undefined,
        files: [
          { mimetype: "audio/mpeg", filename: "audio-file.mp3" },
          { mimetype: "audio/aac", filename: "audio-file2.aac" },
        ],
      } as Request;
      const res = mockResponse;
      const next = mockNext;

      await ensureAudioMIMEtype(req, res, next);

      expect(next).toBeCalled();
    });

    it("should throw an error for invalid audio mimetype", async () => {
      const req = mockRequest as Request;
      const res = mockResponse;
      const next = mockNext;

      // Setup the request with an invalid audio mimetype
      req.file = {
        mimetype: "image/jpeg",
        filename: "test_image.jpeg",
      } as Express.Multer.File;
      req.files = undefined;

      try {
        await ensureAudioMIMEtype(req, res, next);
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).type).toBe(API_ERROR_TYPES.BAD_REQUEST);
      }
    });
  });

  describe("ensureImageMIMEtype", () => {
    it("should pass for valid image mimetype", async () => {
      const req = {
        ...mockRequest,
        file: { mimetype: "image/jpeg", filename: "image-file.jpeg" },
        files: undefined,
      } as Request;
      const res = mockResponse;
      const next = mockNext;

      await ensureImageMIMEtype(req, res, next);

      expect(next).toBeCalled();
    });

    it("should throw an error for invalid image mimetype", async () => {
      const req = mockRequest as Request;
      const res = mockResponse;
      const next = mockNext;

      // Setup the request with an invalid audio mimetype
      req.file = {
        mimetype: "text/plain",
        filename: "file-secrets.txt",
      } as Express.Multer.File;
      req.files = undefined;

      try {
        await ensureImageMIMEtype(req, res, next);
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).type).toBe(API_ERROR_TYPES.BAD_REQUEST);
      }
    });
  });

  describe("ensureTextMIMEtype", () => {
    it("should pass for valid text mimetype", async () => {
      const req = {
        ...mockRequest,
        file: { mimetype: "text/plain", filename: "text-file.txt" },
        files: undefined,
      } as Request;
      const res = mockResponse;
      const next = mockNext;

      await ensureTextMIMEtype(req, res, next);

      expect(next).toBeCalled();
    });

    it("should throw an error for invalid text mimetype", async () => {
      const req = mockRequest as Request;
      const res = mockResponse;
      const next = mockNext;

      // Setup the request with an invalid audio mimetype
      req.file = {
        mimetype: "video/mpeg",
        filename: "video-file.mp4",
      } as Express.Multer.File;
      req.files = undefined;

      try {
        await ensureTextMIMEtype(req, res, next);
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).type).toBe(API_ERROR_TYPES.BAD_REQUEST);
      }
    });
  });

  describe("ensureFileMimeType", () => {
    it("should throw an error if no file is provided", async () => {
      const req = mockRequest as Request;
      const res = mockResponse;
      const next = mockNext;

      // Setup the request with an invalid audio mimetype
      req.file = undefined;
      req.files = undefined;

      const ensureFileMimeTypeCallbacks = [
        ensureAudioMIMEtype,
        ensureImageMIMEtype,
        ensureTextMIMEtype,
      ];

      ensureFileMimeTypeCallbacks.forEach(async (callback) => {
        try {
          await callback(req, res, next);
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError);
          expect((error as ApiError).type).toBe(API_ERROR_TYPES.NOT_FOUND);
        }
      });
    });
  });
});
