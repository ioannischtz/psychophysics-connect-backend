import { Request, Response } from "express";
import MediaAssetDAO, { OptionalMediaAsset } from "../db/daos/MediaAssetDAO.js";
import { MediaAsset } from "../db/models/MediaAsset/mediaAsset.valSchemas.js";
import { Types } from "mongoose";
import {
  API_ERROR_TYPES,
  ApiError,
  httpStatusCodes,
} from "../middleware/errors.js";
import logger from "../middleware/logger.js";
import PerceptualDimensionDAO from "../db/daos/PerceptualDimensionDAO.js";
import {
  AudioMIMEtypes,
  ImageMIMEtypes,
  MIMEtypes,
  TextMIMEtypes,
} from "mimetypes.js";
import persistFileGridFS from "../services/persistFileGridFS.js";
import { multerDestPath } from "../config.js";
import deleteFileGridFS from "../services/deleteFileGridFS.js";
import editFileGridFS from "../services/editFileGridFS.js";
import downloadFileGridFS from "../services/downloadFileGridFS.js";

async function create(req: Request, res: Response): Promise<void> {
  const { mimetype, filename } = req.body;
  const newMediaAsset: Omit<MediaAsset, "_id"> = {
    mimetype,
    filename,
  };
  const createdMediaAsset = await MediaAssetDAO.create(
    newMediaAsset as MediaAsset,
  );

  const responseData = {
    msg: `Created a new MediaAsset successfully`,
    createdMediaAsset,
  };
  logger.info(responseData.msg, responseData.createdMediaAsset);

  res.status(httpStatusCodes.OK).json(responseData);
}

async function uploadSingle(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    throw new ApiError(API_ERROR_TYPES.BAD_REQUEST, "req.file not provided");
  }
  const { originalname, mimetype } = req.file as Express.Multer.File;

  type SupportedMIMEtypes = AudioMIMEtypes | ImageMIMEtypes | TextMIMEtypes;

  const fileDidPersist = await persistFileGridFS({
    fileName: originalname,
    filePath: `${multerDestPath}/${originalname}`,
    mimetype: mimetype as SupportedMIMEtypes, // we use a middleware to ensure is supported mimetype
  });

  if (!fileDidPersist) {
    throw new ApiError(API_ERROR_TYPES.INTERNAL, "Upload failed");
  }

  const createdMediaAsset = await MediaAssetDAO.create({
    mimetype,
    filename: originalname,
  } as MediaAsset);

  const responseData = {
    msg: `Uploaded a new MediaAsset successfully`,
    createdMediaAsset,
  };
  logger.info(responseData.msg, responseData.createdMediaAsset);

  res.status(httpStatusCodes.OK).json(responseData);
}

async function uploadMulti(req: Request, res: Response): Promise<void> {
  if (!req.files) {
    throw new ApiError(API_ERROR_TYPES.BAD_REQUEST, "req.files not provided");
  }
  const filesToUp = req.files as Express.Multer.File[];

  type SupportedMIMEtypes = AudioMIMEtypes | ImageMIMEtypes | TextMIMEtypes;

  let createdMediaAssets: MediaAsset[] = [];

  for (let idx = 0; idx < filesToUp.length; idx++) {
    const { originalname, mimetype } = filesToUp[idx];

    const fileDidPersist = await persistFileGridFS({
      fileName: originalname,
      filePath: `${multerDestPath}/${originalname}`,
      mimetype: mimetype as SupportedMIMEtypes, // we use a middleware to ensure is supported mimetype
    });

    if (!fileDidPersist) {
      throw new ApiError(API_ERROR_TYPES.INTERNAL, "Upload failed");
    }

    const createdMediaAsset = await MediaAssetDAO.create({
      mimetype,
      filename: originalname,
    } as MediaAsset);

    if (!createdMediaAsset) {
      throw new ApiError(
        API_ERROR_TYPES.INTERNAL,
        "Failed to create MediaAsset",
      );
    }

    createdMediaAssets[idx] = createdMediaAsset;
  }

  const responseData = {
    msg: `Uploaded MediaAsset files successfully`,
    createdMediaAssets,
  };
  logger.info(responseData.msg, responseData.createdMediaAssets);

  res.status(httpStatusCodes.OK).json(responseData);
}

async function edit(req: Request, res: Response): Promise<void> {
  const { mediaAssetId } = req.params;
  const { filename } = req.body;

  let mediaAsset: OptionalMediaAsset = {
    _id: new Types.ObjectId(mediaAssetId),
  };

  if (filename) {
    mediaAsset.filename = filename;
  }

  const editedMediaAsset = await MediaAssetDAO.update(mediaAsset);

  if (!editedMediaAsset) {
    throw new ApiError(
      API_ERROR_TYPES.NOT_FOUND,
      "Failed to edit the MediaAsset",
    );
  }

  const fileEdited = await editFileGridFS(
    {
      filename: editedMediaAsset.filename as string,
      mimetype: editedMediaAsset.mimetype as
        | AudioMIMEtypes
        | ImageMIMEtypes
        | TextMIMEtypes,
    },
    filename,
  );

  if (!fileEdited) {
    throw new ApiError(API_ERROR_TYPES.INTERNAL, "File edit failed");
  }

  const responseData = {
    msg: `MediaAsset: ${mediaAssetId} was edited successfully`,
    editedMediaAsset,
  };
  logger.info(responseData.msg, responseData.editedMediaAsset);

  res.status(httpStatusCodes.OK).json(responseData);
}

async function remove(req: Request, res: Response): Promise<void> {
  const { mediaAssetId } = req.params;

  // Find the media asset by ID
  const mediaAsset = await MediaAssetDAO.findById(
    new Types.ObjectId(mediaAssetId),
  );

  if (!mediaAsset) {
    throw new ApiError(API_ERROR_TYPES.NOT_FOUND, "MediaAsset not found");
  }

  const mediaAssetDidDelete = await MediaAssetDAO.deleteById(
    new Types.ObjectId(mediaAssetId),
  );

  if (!mediaAssetDidDelete) {
    throw new ApiError(API_ERROR_TYPES.INTERNAL, "MediaAsset failed to delete");
  }

  const fileDidDelete = await deleteFileGridFS(
    mediaAsset.filename as string,
    mediaAsset.mimetype as AudioMIMEtypes | ImageMIMEtypes | TextMIMEtypes,
  );

  if (!fileDidDelete) {
    throw new ApiError(
      API_ERROR_TYPES.INTERNAL,
      "underlying file failed to delete",
    );
  }

  const responseData = {
    msg: `MediaAsset: ${mediaAssetId} deleted successfully`,
  };
  logger.info(responseData.msg);

  res.status(httpStatusCodes.OK).json(responseData);
}

async function downloadSingle(req: Request, res: Response): Promise<void> {
  const { mediaAssetId } = req.params;
  const mediaAsset = await MediaAssetDAO.findById(
    new Types.ObjectId(mediaAssetId),
  );
  if (!mediaAsset) {
    throw new ApiError(API_ERROR_TYPES.NOT_FOUND, "MediaAsset not found");
  }

  res.set("content-type", mediaAsset.mimetype);
  res.set("accept-ranges", "bytes");

  await downloadFileGridFS(
    mediaAsset.filename as string,
    mediaAsset.mimetype as AudioMIMEtypes | ImageMIMEtypes | TextMIMEtypes,
    res,
  );
}

async function listMediaAssetsByType(
  req: Request,
  res: Response,
): Promise<Response<MediaAsset[], Record<string, any>>> {
  const { mimetype } = req.body;
  const mediaAssets = await MediaAssetDAO.findAllByMimetype(mimetype);

  const responseData = {
    msg: `Fetched all media assets of type:${mimetype} successfully`,
    mediaAssets,
  };
  logger.info(responseData.msg, responseData.mediaAssets);

  return res.status(httpStatusCodes.OK).json(responseData);
}

async function listMediaAssetsForPerceptualDimension(
  req: Request,
  res: Response,
): Promise<void> {
  const { perceptualDimensionId } = req.params;
  const mediaAssets = await MediaAssetDAO.findAllByPerceptualDimension(
    new Types.ObjectId(perceptualDimensionId),
  );

  const responseData = {
    msg:
      `Fetched all media assets for perceptualDimension:${perceptualDimensionId} successfully`,
    mediaAssets,
  };
  logger.info(responseData.msg, responseData.mediaAssets);

  res.status(httpStatusCodes.OK).json(responseData);
}

async function queryMediaAssets(req: Request, res: Response): Promise<void> {
  const { mimetype, perceptualDimensionId } = req.query;

  // Prepare filter criteria based on request parameters
  const filterCriteria: Record<string, any> = {};
  if (mimetype) {
    filterCriteria.mimetype = mimetype;
  }

  if (perceptualDimensionId) {
    const perceptualDimension = await PerceptualDimensionDAO.findById(
      new Types.ObjectId(perceptualDimensionId),
    );

    if (!perceptualDimension) {
      res
        .status(httpStatusCodes.NOT_FOUND)
        .json({ error: "PerceptualDimension not found" });
    }

    filterCriteria.perceptualDimensionId = perceptualDimensionId;
  }

  // Query media assets based on filter criteria
  let mediaAssets: MediaAsset[] = [];

  // I am aware that the following code is weird and unnecessary.
  // Just experimenting with different ways of implementing quering with
  // multiple optional criteria.
  if (!!filterCriteria.mimetype && !!filterCriteria.perceptualDimensionId) {
    const fetchedMediaAssets = await MediaAssetDAO
      .findAllByMimetypeForPerceptualDimension(
        mimetype,
        filterCriteria.perceptualDimensionId,
      );
    mediaAssets.push(...fetchedMediaAssets);
  } else {
    for (const filterCriterion in filterCriteria) {
      let daoCallback: (
        field: MIMEtypes | Types.ObjectId | string,
      ) => Promise<MediaAsset[]>;
      switch (filterCriterion) {
        case "mimetype":
          daoCallback = MediaAssetDAO.findAllByMimetype;
          break;
        case "perceptualDimensionId":
          daoCallback = MediaAssetDAO.findAllByPerceptualDimension;
          break;
        default:
          daoCallback = MediaAssetDAO.findAllByMimetype;
      }
      const fetchedMediaAssets = await daoCallback(filterCriterion);
      mediaAssets.push(...fetchedMediaAssets);
    }
  }

  const responseData = {
    msg:
      `Queried media assets based on the following filter-criteria: ${filterCriteria}`,
    mediaAssets,
  };
  logger.info(responseData.msg, responseData.mediaAssets);

  res.status(httpStatusCodes.OK).json(responseData);
}

export default {
  uploadSingle,
  uploadMulti,
  downloadSingle,
  edit,
  remove,
  listMediaAssetsByType,
  listMediaAssetsForPerceptualDimension,
  queryMediaAssets,
};
