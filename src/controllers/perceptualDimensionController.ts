import { Request, Response } from "express";
import PerceptualDimensionDAO, {
  PerceptualDimensionType,
} from "../db/daos/PerceptualDimensionDAO.js";
import { PerceptualDimension } from "../db/models/PerceptualDimension/perceptualDimension.valSchemas.js";
import { Types } from "mongoose";
import {
  API_ERROR_TYPES,
  ApiError,
  httpStatusCodes,
} from "../middleware/errors.js";
import logger from "../middleware/logger.js";

async function create(req: Request, res: Response): Promise<void> {
  const { title, type, description, mediaAssetIds } = req.body;
  const newPerceptualDimension: Omit<PerceptualDimension, "_id"> = {
    title,
    type,
    description,
    mediaAssets: mediaAssetIds.map(
      (mAssetId: string) => new Types.ObjectId(mAssetId),
    ),
    experiments: [],
  };
  const createdPerceptualDimension = await PerceptualDimensionDAO.create(
    newPerceptualDimension as PerceptualDimension,
  );

  const responseData = {
    msg: `Created a new PerceptualDimension successfully`,
    createdPerceptualDimension,
  };
  logger.info(responseData.msg, responseData.createdPerceptualDimension);

  res.status(httpStatusCodes.OK).json(responseData);
}

async function edit(req: Request, res: Response): Promise<void> {
  const { perceptualDimensionId } = req.params;
  const { title, type, description, mediaAssetsToAdd, mediaAssetsToRemove } =
    req.body;

  const existingPerceptualDimension = await PerceptualDimensionDAO.findById(
    new Types.ObjectId(perceptualDimensionId),
  );

  if (!existingPerceptualDimension) {
    throw new ApiError(
      API_ERROR_TYPES.NOT_FOUND,
      "PerceptualDimension not found",
    );
  }

  if (title) {
    existingPerceptualDimension.title = title;
  }

  if (type) {
    existingPerceptualDimension.type = type;
  }

  if (description) {
    existingPerceptualDimension.description = description;
  }

  // Handle adding and removing mediaAssets
  if (!existingPerceptualDimension.mediaAssets) {
    existingPerceptualDimension.mediaAssets = [];
  }
  if (mediaAssetsToAdd) {
    existingPerceptualDimension.mediaAssets.push(...mediaAssetsToAdd);
  }
  if (mediaAssetsToRemove) {
    existingPerceptualDimension.mediaAssets = existingPerceptualDimension
      .mediaAssets.filter(
        (mediaAsset) => !mediaAssetsToRemove.includes(mediaAsset),
      );
  }
  const editedPerceptualDimension = await PerceptualDimensionDAO.update(
    existingPerceptualDimension,
  );

  if (!editedPerceptualDimension) {
    res
      .status(httpStatusCodes.NOT_FOUND)
      .json({ error: "Failed to edit PerceptualDimension" });
  }

  const responseData = {
    msg:
      `PerceptualDimension: ${perceptualDimensionId} was edited successfully`,
    editedPerceptualDimension,
  };
  logger.info(responseData.msg, responseData.editedPerceptualDimension);

  res.status(httpStatusCodes.OK).json(responseData);
}

async function remove(req: Request, res: Response): Promise<void> {
  const { perceptualDimensionId } = req.params;
  const perceptualDimensionDidDelete = await PerceptualDimensionDAO.deleteById(
    new Types.ObjectId(perceptualDimensionId),
  );

  if (!perceptualDimensionDidDelete) {
    res
      .status(httpStatusCodes.NOT_FOUND)
      .json({ msg: "ERROR: PerceptualDimension not found" });
  }

  const responseData = {
    msg: `PerceptualDimension: ${perceptualDimensionId} deleted successfully`,
  };
  logger.info(responseData.msg);

  res.status(httpStatusCodes.OK).json(responseData);
}

async function listPerceptualDimensionsForExperiment(
  req: Request,
  res: Response,
): Promise<void> {
  const { experimentId } = req.params;

  const perceptualDimensions = await PerceptualDimensionDAO
    .findAllByExperimentId(
      new Types.ObjectId(experimentId),
    );

  const responseData = {
    msg:
      `Fetched the perceptualDimensions of experiment: ${experimentId} successfully`,
    perceptualDimensions,
  };
  logger.info(responseData.msg, responseData.perceptualDimensions);

  res.status(httpStatusCodes.OK).json(responseData);
}

async function listAllPerceptualDimensionsOfType(
  req: Request,
  res: Response,
): Promise<void> {
  const { type } = req.params;
  const perceptualDimensions = await PerceptualDimensionDAO.findAllByType(
    type as PerceptualDimensionType,
  );
  const responseData = {
    msg: `Fetched all perceptualDimensions of type:${type}`,
    perceptualDimensions,
  };

  logger.info(responseData.perceptualDimensions, responseData.msg);
  res.status(httpStatusCodes.OK).json(responseData);
}

async function queryPerceptualDimensions(
  req: Request,
  res: Response,
): Promise<void> {
  const { type, mediaAssetId, experimentId } = req.body;

  let queriedPerceptualDimensions: PerceptualDimension[] = [];

  if (type) {
    const fetchedPerceptualDimensions = await PerceptualDimensionDAO
      .findAllByType(type);
    queriedPerceptualDimensions.push(...fetchedPerceptualDimensions);
  }

  if (mediaAssetId) {
    const fetchedPerceptualDimensions = await PerceptualDimensionDAO
      .findAllByMediaAssetId(
        new Types.ObjectId(mediaAssetId),
      );
    queriedPerceptualDimensions.push(...fetchedPerceptualDimensions);
  }

  if (experimentId) {
    const fetchedPerceptualDimensions = await PerceptualDimensionDAO
      .findAllByExperimentId(
        new Types.ObjectId(experimentId),
      );
    queriedPerceptualDimensions.push(...fetchedPerceptualDimensions);
  }

  const responseData = {
    msg: `Queried stimuli based on type:${type || "*"}, mediaAsset:${
      mediaAssetId || "*"
    }, experimentId:${experimentId || "*"} successfully`,
    queriedPerceptualDimensions,
  };
  logger.info(responseData.msg, responseData.queriedPerceptualDimensions);

  res.status(httpStatusCodes.OK).json(responseData);
}

export default {
  create,
  edit,
  remove,
  listPerceptualDimensionsForExperiment,
  listAllPerceptualDimensionsOfType,
  queryPerceptualDimensions,
};
