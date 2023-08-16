import { Request, Response } from "express";
import MediaAssetDAO, { OptionalMediaAsset } from "../db/daos/MediaAssetDAO.js";
import { MediaAsset } from "../db/models/MediaAsset/mediaAsset.valSchemas.js";
import { Types } from "mongoose";
import { httpStatusCodes } from "../middleware/errors.js";
import logger from "../middleware/logger.js";
import PerceptualDimensionDAO from "../db/daos/PerceptualDimensionDAO.js";
import { PerceptualDimension } from "../db/models/PerceptualDimension/perceptualDimension.valSchemas.js";
import { MIMEtypes } from "mimetypes.js";

async function create(
  req: Request,
  res: Response,
): Promise<Response<MediaAsset, Record<string, any>>> {
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

  return res.status(httpStatusCodes.OK).json(responseData);
}

async function edit(
  req: Request,
  res: Response,
): Promise<Response<MediaAsset, Record<string, any>>> {
  const { mediaAssetId } = req.params;
  const { mimetype, filename } = req.body;

  let mediaAsset: OptionalMediaAsset = {
    _id: new Types.ObjectId(mediaAssetId),
  };

  if (mimetype) {
    mediaAsset.mimetype = mimetype;
  }

  if (filename) {
    mediaAsset.filename = filename;
  }

  const editedMediaAsset = await MediaAssetDAO.update(mediaAsset);

  if (!editedMediaAsset) {
    return res
      .status(httpStatusCodes.NOT_FOUND)
      .json({ error: "Failed to edit MediaAsset" });
  }

  const responseData = {
    msg: `MediaAsset: ${mediaAssetId} was edited successfully`,
    editedMediaAsset,
  };
  logger.info(responseData.msg, responseData.editedMediaAsset);

  return res.status(httpStatusCodes.OK).json(responseData);
}

async function remove(
  req: Request,
  res: Response,
): Promise<Response<{ msg: string }, Record<string, any>>> {
  const { mediaAssetId } = req.params;
  const mediaAssetDidDelete = await MediaAssetDAO.deleteById(
    new Types.ObjectId(mediaAssetId),
  );

  if (!mediaAssetDidDelete) {
    return res
      .status(httpStatusCodes.NOT_FOUND)
      .json({ msg: "ERROR: MediaAsset not found" });
  }

  const responseData = {
    msg: `MediaAsset: ${mediaAssetId} deleted successfully`,
  };
  logger.info(responseData.msg);

  return res.status(httpStatusCodes.OK).json(responseData);
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
): Promise<Response<MediaAsset[], Record<string, any>>> {
  const { perceptualDimensionId } = req.body;
  const mediaAssets = await MediaAssetDAO.findAllByPerceptualDimension(
    perceptualDimensionId,
  );

  const responseData = {
    msg:
      `Fetched all media assets for perceptualDimension:${perceptualDimensionId} successfully`,
    mediaAssets,
  };
  logger.info(responseData.msg, responseData.mediaAssets);

  return res.status(httpStatusCodes.OK).json(responseData);
}

async function queryMediaAssets(
  req: Request,
  res: Response,
): Promise<Response<MediaAsset[], Record<string, any>>> {
  const { mimetype, perceptualDimensionId } = req.body;

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
      return res
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

  return res.status(httpStatusCodes.OK).json(responseData);
}

export default {
  create,
  edit,
  remove,
  listMediaAssetsByType,
  listMediaAssetsForPerceptualDimension,
  queryMediaAssets,
};
