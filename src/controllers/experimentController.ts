import { Request, Response } from "express";
import {
  API_ERROR_TYPES,
  ApiError,
  httpStatusCodes,
} from "../middleware/errors.js";
import ExperimentDAO from "../db/daos/ExperimentDAO.js";
import logger from "../middleware/logger.js";
import { Experiment } from "../db/models/Experiment/experiment.valSchemas.js";
import { Types } from "mongoose";

async function listActiveExperiments(
  req: Request,
  res: Response,
): Promise<void> {
  // Get a list of active experiments for the subject's homepage
  const activeExperiments = await ExperimentDAO.findAllActive();
  const responseData = {
    msg: "Fetched all active experiments",
    activeExperiments,
  };
  logger.info(responseData.msg, responseData.activeExperiments);

  res.status(httpStatusCodes.OK).json(responseData);
}

async function listExperimentsForExperimenter(
  req: Request,
  res: Response,
): Promise<void> {
  // Get a list of all experiments created by the experimenter
  const experimenterId = req.sessionData._id; // Assuming you have this in your session
  const experiments = await ExperimentDAO.findAllByUser(experimenterId);

  const responseData = {
    msg: "Fetched all active experiments",
    experiments,
  };
  logger.info(responseData.msg, responseData.experiments);

  res.status(httpStatusCodes.OK).json(responseData);
}

async function addExperiment(req: Request, res: Response): Promise<void> {
  const { title, description, stimuliIds, perceptualDimensionsIds } = req.body;
  const experimenterId = req.sessionData._id;

  // Create a new experiment
  const newExperiment: Omit<Experiment, "_id"> = {
    title,
    description,
    isActive: false,
    experimenter: experimenterId,
    experimentSessions: [],
    stimuli: stimuliIds,
    perceptualDimensions: perceptualDimensionsIds,
  };

  const createdExperiment = await ExperimentDAO.create(
    newExperiment as Experiment,
  );

  const responseData = {
    msg: `Experimenter ${experimenterId} created a new Experiment successfully`,
    createdExperiment,
  };
  logger.info(responseData.msg, responseData.createdExperiment);

  res.status(httpStatusCodes.OK).json(responseData);
}

async function editExperiment(req: Request, res: Response): Promise<void> {
  const { experimentId } = req.params;
  const {
    title,
    description,
    stimuliToAdd,
    stimuliToRemove,
    perceptualDimsToAdd,
    perceptualDimsToRemove,
  } = req.body;

  // Find the experiment by ID
  const popedExperiment = await ExperimentDAO.findById(
    new Types.ObjectId(experimentId),
  );

  if (!popedExperiment) {
    throw new ApiError(API_ERROR_TYPES.NOT_FOUND, "Experiment not found");
  }

  // Shape populated experiment to unpopulated
  const experiment: Required<Experiment> = {
    _id: popedExperiment._id,
    title: popedExperiment.title || "Title",
    description: popedExperiment.description || "description",
    isActive: popedExperiment.isActive || false,
    experimenter: popedExperiment.experimenter._id,
    experimentSessions: popedExperiment.experimentSessions.map(
      (sess) => sess._id,
    ),
    stimuli: popedExperiment.stimuli.map((stim) => stim._id) || [],
    perceptualDimensions:
      popedExperiment.perceptualDimensions.map((dim) => dim._id) || [],
  };

  // Update the experiment fields
  if (title) {
    experiment.title = title;
  }
  if (description) {
    experiment.description = description;
  }

  // Handle adding and removing stimuli
  if (stimuliToAdd) {
    experiment.stimuli.push(...stimuliToAdd);
  }
  if (stimuliToRemove) {
    experiment.stimuli = experiment.stimuli.filter(
      (stimulus) => !stimuliToRemove.includes(stimulus),
    );
  }

  // Handle adding and removing perceptual dimensions
  if (perceptualDimsToAdd) {
    experiment.perceptualDimensions.push(...perceptualDimsToAdd);
  }
  if (perceptualDimsToRemove) {
    experiment.perceptualDimensions = experiment.perceptualDimensions.filter(
      (dim) => !perceptualDimsToRemove.includes(dim),
    );
  }

  const editedExperiment = await ExperimentDAO.update(experiment);

  const responseData = {
    msg: `Experiment ${experimentId} was edited successfully`,
    editedExperiment,
  };
  logger.info(responseData.msg, responseData.editedExperiment);

  res.status(httpStatusCodes.OK).json(responseData);
}

export default {
  listActiveExperiments,
  listExperimentsForExperimenter,
  addExperiment,
  editExperiment,
};
