import { Request, Response } from "express";
import PerceptualDimensionDAO, {
  OptionalPerceptualDimension,
} from "../db/daos/PerceptualDimensionDAO.js";
import { PerceptualDimension } from "../db/models/PerceptualDimension/perceptualDimension.valSchemas.js";
import { Types } from "mongoose";
import { httpStatusCodes } from "../middleware/errors.js";
import logger from "../middleware/logger.js";

async function create(
  req: Request,
  res: Response,
): Promise<Response<PerceptualDimension, Record<string, any>>> {
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

  return res.status(httpStatusCodes.OK).json(responseData);
}

async function edit(
  req: Request,
  res: Response,
): Promise<Response<PerceptualDimension, Record<string, any>>> {
  const { perceptualDimensionId } = req.params;
  const { title, type, description, mediaAssetsToAdd, mediaAssetsToRemove } =
    req.body;

  let perceptualDimension: OptionalPerceptualDimension = {
    _id: new Types.ObjectId(perceptualDimensionId),
  };

  if (title) {
    perceptualDimension.title = title;
  }

  if (type) {
    perceptualDimension.type = type;
  }

  if (description) {
    perceptualDimension.description = description;
  }

  const existingPerceptualDimension = await PerceptualDimensionDAO.findById(
    perceptualDimension._id,
  );

  if (!existingPerceptualDimension) {
    return res
      .status(httpStatusCodes.NOT_FOUND)
      .json({ error: "PerceptualDimension not found" });
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
    perceptualDimension,
  );

  if (!editedPerceptualDimension) {
    return res
      .status(httpStatusCodes.NOT_FOUND)
      .json({ error: "Failed to edit PerceptualDimension" });
  }

  const responseData = {
    msg:
      `PerceptualDimension: ${perceptualDimensionId} was edited successfully`,
    editedPerceptualDimension,
  };
  logger.info(responseData.msg, responseData.editedPerceptualDimension);

  return res.status(httpStatusCodes.OK).json(responseData);
}

async function remove(
  req: Request,
  res: Response,
): Promise<Response<{ msg: string }, Record<string, any>>> {
  const { perceptualDimensionId } = req.params;
  const perceptualDimensionDidDelete = await PerceptualDimensionDAO.deleteById(
    new Types.ObjectId(perceptualDimensionId),
  );

  if (!perceptualDimensionDidDelete) {
    return res
      .status(httpStatusCodes.NOT_FOUND)
      .json({ msg: "ERROR: PerceptualDimension not found" });
  }

  const responseData = {
    msg: `PerceptualDimension: ${perceptualDimensionId} deleted successfully`,
  };
  logger.info(responseData.msg);

  return res.status(httpStatusCodes.OK).json(responseData);
}

async function listPerceptualDimensionsForExperiment(
  req: Request,
  res: Response,
): Promise<Response<PerceptualDimension[], Record<string, any>>> {
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

  return res.status(httpStatusCodes.OK).json(responseData);
}

async function queryPerceptualDimensions(
  req: Request,
  res: Response,
): Promise<Response<PerceptualDimension[], Record<string, any>>> {
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

  return res.status(httpStatusCodes.OK).json(responseData);
}

export default {
  create,
  edit,
  remove,
  listPerceptualDimensionsForExperiment,
  queryPerceptualDimensions,
};
