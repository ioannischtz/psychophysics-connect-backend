import mongoose from "mongoose";
import { dbConnection } from "../db/initDB.js";
import fs from "fs";
import { ApiError } from "../middleware/errors.js";
import { API_ERROR_TYPES } from "../middleware/errors.js";
import {
  AudioMIMEtypes,
  ImageMIMEtypes,
  isAudioMIMEtype,
  isImageMIMEtype,
  isTextMIMEtype,
  TextMIMEtypes,
} from "../db/models/MediaAsset/MimeTypes.js";
import logger from "../middleware/logger.js";
import assert from "assert";

async function persistFileGridFS(fileArgs: {
  fileName: string;
  filePath: fs.PathLike;
  mimetype: AudioMIMEtypes | ImageMIMEtypes | TextMIMEtypes;
}): Promise<boolean> {
  const { fileName, filePath, mimetype } = fileArgs;

  if (!fileName || !filePath) {
    const missedValue = !fileName ? "fileName" : "filePath";
    throw new ApiError(
      API_ERROR_TYPES.BAD_REQUEST,
      `${missedValue} is required`,
    );
  }

  if (!fs.existsSync(filePath)) {
    throw new ApiError(API_ERROR_TYPES.NOT_FOUND, "File doen't exist");
  }

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

    const uploadStream = bucket.openUploadStream(fileName);
    fs.createReadStream(filePath).pipe(uploadStream);
    return new Promise((resolve, reject) => {
      uploadStream
        .on("error", function (error) {
          logger.error("error uploadStream");
          assert.ifError(error);
        })
        .on("finish", () => {
          fs.unlinkSync(filePath);
          resolve(this);
        });
    });
  } catch (error) {
    throw error;
  }
}

export default persistFileGridFS;
