import { Request, Response } from "express";
import StimulusDAO, { OptionalStimulus } from "../db/daos/StimulusDAO.js";
import { Stimulus } from "../db/models/Stimulus/stimulus.valSchemas.js";
import { Types } from "mongoose";
import { httpStatusCodes } from "../middleware/errors.js";
import logger from "../middleware/logger.js";

async function create(
  req: Request,
  res: Response,
): Promise<Response<Stimulus, Record<string, any>>> {
  const { title, type, description, mediaAssetId } = req.body;
  const newStimulus: Omit<Stimulus, "_id"> = {
    title,
    type,
    description,
    mediaAsset: new Types.ObjectId(mediaAssetId),
    experiments: [],
  };
  const createdStimulus = await StimulusDAO.create(newStimulus as Stimulus);

  const responseData = {
    msg: `Created a new Stimulus successfully`,
    createdStimulus,
  };
  logger.info(responseData.msg, responseData.createdStimulus);

  return res.status(httpStatusCodes.OK).json(responseData);
}

async function edit(
  req: Request,
  res: Response,
): Promise<Response<Stimulus, Record<string, any>>> {
  const { stimulusId } = req.params;
  const { title, type, description, mediaAssetId } = req.body;

  let stimulus: OptionalStimulus = {
    _id: new Types.ObjectId(stimulusId),
  };

  if (title) {
    stimulus.title = title;
  }

  if (type) {
    stimulus.type = type;
  }

  if (description) {
    stimulus.description = description;
  }

  if (mediaAssetId) {
    stimulus.mediaAsset = new Types.ObjectId(mediaAssetId);
  }

  const editedStimulus = await StimulusDAO.update(stimulus);

  if (!editedStimulus) {
    return res
      .status(httpStatusCodes.NOT_FOUND)
      .json({ error: "Stimulus not found" });
  }

  const responseData = {
    msg: `Stimulus: ${stimulusId} was edited successfully`,
    editedStimulus,
  };
  logger.info(responseData.msg, responseData.editedStimulus);

  return res.status(httpStatusCodes.OK).json(responseData);
}

async function remove(
  req: Request,
  res: Response,
): Promise<Response<{ msg: string }, Record<string, any>>> {
  const { stimulusId } = req.params;
  const stimulusDidDelete = await StimulusDAO.deleteById(
    new Types.ObjectId(stimulusId),
  );

  if (!stimulusDidDelete) {
    return res
      .status(httpStatusCodes.NOT_FOUND)
      .json({ msg: "ERROR: Stimulus not found" });
  }

  const responseData = {
    msg: `Stimulus: ${stimulusId} deleted successfully`,
  };
  logger.info(responseData.msg);

  return res.status(httpStatusCodes.OK).json(responseData);
}

async function listStimuliForExperiment(
  req: Request,
  res: Response,
): Promise<Response<Stimulus[], Record<string, any>>> {
  const { experimentId } = req.params;

  const stimuli = await StimulusDAO.findAllByExperimentId(
    new Types.ObjectId(experimentId),
  );

  const responseData = {
    msg: `Fetched the stimuli of experiment: ${experimentId} successfully`,
    stimuli,
  };
  logger.info(responseData.msg, responseData.stimuli);

  return res.status(httpStatusCodes.OK).json(responseData);
}

async function queryStimuli(
  req: Request,
  res: Response,
): Promise<Response<Stimulus[], Record<string, any>>> {
  const { type, mediaAssetId, experimentId } = req.body;

  let queriedStimuli: Stimulus[] = [];

  if (type) {
    const fetchedStimuli = await StimulusDAO.findAllByType(type);
    queriedStimuli.push(...fetchedStimuli);
  }

  if (mediaAssetId) {
    const fetchedStimuli = await StimulusDAO.findAllByMediaAsset({
      _id: new Types.ObjectId(mediaAssetId),
    });
    queriedStimuli.push(...fetchedStimuli);
  }

  if (experimentId) {
    const fetchedStimuli = await StimulusDAO.findAllByExperimentId(
      new Types.ObjectId(experimentId),
    );
    queriedStimuli.push(...fetchedStimuli);
  }

  const responseData = {
    msg: `Queried stimuli based on type:${type || "*"}, mediaAsset:${
      mediaAssetId || "*"
    }, experimentId:${experimentId || "*"} successfully`,
    queriedStimuli,
  };
  logger.info(responseData.msg, responseData.queriedStimuli);

  return res.status(httpStatusCodes.OK).json(responseData);
}

export default {
  create,
  edit,
  remove,
  listStimuliForExperiment,
  queryStimuli,
};