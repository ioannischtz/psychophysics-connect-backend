import {
  AudioMIMEtypes,
  ImageMIMEtypes,
  isAudioMIMEtype,
  isImageMIMEtype,
  isTextMIMEtype,
  TextMIMEtypes,
} from "../db/models/MediaAsset/MimeTypes.js";
import { dbConnection } from "../db/initDB.js";
import mongoose from "mongoose";
import {
  API_ERROR_TYPES,
  ApiError,
  httpStatusCodes,
} from "../middleware/errors.js";
import { Response } from "express";
import logger from "../middleware/logger.js";

async function downloadFileGridFS(
  filename: string,
  mimetype: AudioMIMEtypes | ImageMIMEtypes | TextMIMEtypes,
  res: Response,
): Promise<void> {
  let bucketName: string = "";

  if (isAudioMIMEtype(mimetype)) {
    bucketName = "audioFiles";
  }

  if (isImageMIMEtype(mimetype)) {
    bucketName = "imageFiles";
  }

  if (isTextMIMEtype(mimetype)) {
    bucketName = "textFiles";
  }

  try {
    const bucket = new mongoose.mongo.GridFSBucket(dbConnection.db, {
      bucketName,
    });

    let downloadStream = bucket.openDownloadStreamByName(filename);

    downloadStream.on("data", (chunk) => {
      res.write(chunk);
    });

    downloadStream.on("error", () => {
      logger.error("downloadStream error");
      res.sendStatus(httpStatusCodes.NOT_FOUND);
    });

    downloadStream.on("end", () => {
      res.end();
    });
  } catch (error) {
    logger.error(error);
    throw new ApiError(API_ERROR_TYPES.INTERNAL, "Server error");
  }
}

export default downloadFileGridFS;
