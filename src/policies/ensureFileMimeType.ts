import { NextFunction, Request, Response } from "express";
import {
  AudioMIMEtypes,
  ImageMIMEtypes,
  isAudioMIMEtype,
  isImageMIMEtype,
  isTextMIMEtype,
  TextMIMEtypes,
} from "mimetypes.js";
import {
  API_ERROR_TYPES,
  ApiError,
  httpStatusCodes,
} from "../middleware/errors.js";

function generateEnsureFileMimeType(
  mimetype: AudioMIMEtypes | ImageMIMEtypes | TextMIMEtypes,
) {
  let isMimeTypeCallback:
    | typeof isAudioMIMEtype
    | typeof isImageMIMEtype
    | typeof isTextMIMEtype;
  if (isAudioMIMEtype(mimetype)) {
    isMimeTypeCallback = isAudioMIMEtype;
  } else if (isImageMIMEtype(mimetype)) {
    isMimeTypeCallback = isImageMIMEtype;
  } else if (isTextMIMEtype(mimetype)) {
    isMimeTypeCallback = isTextMIMEtype;
  } else {
    throw new Error(
      "mimetype should be either AudioMIMEtypes, ImageMIMEtypes or TextMIMEtypes",
    );
  }
  return async function isFileMimeType(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const files = req.files as Express.Multer.File[];
    const file = req.file;
    if (!files && !file) {
      throw new ApiError(API_ERROR_TYPES.NOT_FOUND, "No file provided");
    }

    if (files) {
      files.forEach((fl, idx) => {
        if (!isMimeTypeCallback(fl.mimetype)) {
          throw new ApiError(
            API_ERROR_TYPES.BAD_REQUEST,
            `File:${idx}, with name:${fl.filename} doesn't have an acceptable mimetype`,
          );
        }
      });
    }

    if (file) {
      if (!isMimeTypeCallback(file.mimetype)) {
        throw new ApiError(
          API_ERROR_TYPES.BAD_REQUEST,
          `File ${file.filename} doesn't have an acceptable mimetype`,
        );
      }
    }
    next();
  };
}

export const ensureAudioMIMEtype = generateEnsureFileMimeType("audio/mpeg");
export const ensureImageMIMEtype = generateEnsureFileMimeType("image/png");
export const ensureTextMIMEtype = generateEnsureFileMimeType("text/plain");
