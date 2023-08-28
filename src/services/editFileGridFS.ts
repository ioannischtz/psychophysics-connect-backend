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
import { API_ERROR_TYPES, ApiError } from "../middleware/errors.js";

async function editFileGridFS(
  fileToDelete: {
    filename: string;
    mimetype: AudioMIMEtypes | ImageMIMEtypes | TextMIMEtypes;
  },
  newFilename: string,
): Promise<boolean> {
  let bucketName: string = "";

  if (isAudioMIMEtype(fileToDelete.mimetype)) {
    bucketName = "audioFiles";
  }

  if (isImageMIMEtype(fileToDelete.mimetype)) {
    bucketName = "imageFiles";
  }

  if (isTextMIMEtype(fileToDelete.mimetype)) {
    bucketName = "textFiles";
  }

  const bucket = new mongoose.mongo.GridFSBucket(dbConnection.db, {
    bucketName,
  });

  const files = await bucket
    .find({ filename: fileToDelete.filename })
    .toArray();
  if (!files) {
    throw new ApiError(API_ERROR_TYPES.NOT_FOUND, "file not found");
  }
  const file = files[0];
  try {
    bucket.rename(file._id, newFilename);
    return true;
  } catch (error) {
    return false;
  }
}

export default editFileGridFS;
