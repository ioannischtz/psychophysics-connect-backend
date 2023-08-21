import {
  AudioMIMEtypes,
  ImageMIMEtypes,
  isAudioMIMEtype,
  isImageMIMEtype,
  isTextMIMEtype,
  TextMIMEtypes,
} from "mimetypes.js";
import { dbConnection } from "../db/initDB.js";
import mongoose from "mongoose";
import { API_ERROR_TYPES, ApiError } from "../middleware/errors.js";

async function deleteFileGridFS(
  filename: string,
  mimetype: AudioMIMEtypes | ImageMIMEtypes | TextMIMEtypes,
): Promise<boolean> {
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

  const bucket = new mongoose.mongo.GridFSBucket(dbConnection.db, {
    bucketName,
  });

  const files = await bucket.find({ filename: filename }).toArray();
  if (!files) {
    throw new ApiError(API_ERROR_TYPES.NOT_FOUND, "file not found");
  }
  const file = files[0];

  try {
    await bucket.delete(file._id);
    return true;
  } catch (error) {
    return false;
  }
}

export default deleteFileGridFS;
