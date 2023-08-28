import { Request, Response } from "express";
import { ExperimentSession } from "../db/models/ExperimentSession/experimentSession.valSchemas.js";
import ExperimentSessionDAO, {
  ExperimentSessionPopulated,
  Subject,
} from "../db/daos/ExperimentSessionDAO.js";
import ExperimentDAO from "../db/daos/ExperimentDAO.js";
import { Response as ExperimentResponse } from "../db/models/Response/response.valSchemas.js";
import {
  API_ERROR_TYPES,
  ApiError,
  httpStatusCodes,
} from "../middleware/errors.js";
import { generateShuffledIndexes } from "../services/generateShuffledIndexes.js";
import logger from "../middleware/logger.js";
import { Types } from "mongoose";

// --- Subject ---

type NewSessionResponse = ExperimentSession;

async function newSession(req: Request, res: Response): Promise<void> {
  const { experimentId } = req.body;

  // Get the subject's user ID from (browser/cookie) session data
  const subjectId = req.sessionData._id;

  // Check if subject is logged in
  if (!subjectId) {
    throw new ApiError(
      API_ERROR_TYPES.UNAUTHORIZED,
      "Subject user is not logged in",
    );
  }

  // Check if the experiment exists
  const experiment = await ExperimentDAO.findById(experimentId);
  if (!experiment) {
    throw new ApiError(API_ERROR_TYPES.NOT_FOUND, "Experiment not found");
  }

  // Generate the shuffled stimuli_order array using the appropriate service
  const stimuli_order = generateShuffledIndexes(experiment.stimuli.length);

  // Initialize the data
  const experimentSessionData: Omit<ExperimentSession, "_id"> = {
    subject: subjectId,
    experiment: experimentId,
    isCompleted: false,
    experiment_step: 0,
    stimuli_order,
    responses: [],
  };

  // Create the session
  const createdSession = await ExperimentSessionDAO.create(
    experimentSessionData as ExperimentSession,
  );

  // Save experimentId and numStimuli in the session data
  req.sessionData.experimentId = experimentId;
  req.sessionData.numStimuli = experiment.stimuli.length;
  req.sessionData.perceptualDimensionsIds = experiment.perceptualDimensions;

  // Set session data
  res.setSessionData(req.sessionData);

  logger.info(
    `Subject with id:${subjectId} created a new session`,
    createdSession,
  );

  res.status(httpStatusCodes.CREATED).json(createdSession);
}

async function getAllByUser(req: Request, res: Response): Promise<void> {
  const subjectId = req.sessionData._id;

  // Check if subject is logged in
  if (!subjectId) {
    throw new ApiError(
      API_ERROR_TYPES.UNAUTHORIZED,
      "Subject user is not logged in",
    );
  }

  // Retrieve experiment sessions for the subject
  const experimentSessions = await ExperimentSessionDAO.findAllByUser(
    subjectId,
  );

  const responseData = {
    msg: "Fetched all(ongoing/completed) of the subject's experiment-sessions ",
    experimentSessions,
  };

  logger.info(responseData.msg, responseData.experimentSessions);

  res.status(httpStatusCodes.OK).json(responseData);
}

type RespondSingleResponse = {
  msg: string;
  updatedExperimentSession: ExperimentSessionPopulated;
};

async function respondSingle(req: Request, res: Response): Promise<void> {
  const { responseVal, responseMode, playCount, timeElapsed, perceptualDimId } =
    req.body;

  // Get the subject's user ID and experiment session data from the browser session
  const loggedInUser: Subject = {
    _id: req.sessionData._id,
    username: req.sessionData.username,
    role: req.sessionData.role,
    email: req.sessionData.email,
  };
  const experimentId: Types.ObjectId = req.sessionData.experimentId;
  const perceptualDimensionsIds: Types.ObjectId[] =
    req.sessionData.perceptualDimensionsIds;
  const numStimuli: number = req.sessionData.numStimuli;
  const numPerceptualDims: number = perceptualDimensionsIds.length;

  // Check if subject is logged in
  if (!loggedInUser._id) {
    throw new ApiError(
      API_ERROR_TYPES.UNAUTHORIZED,
      "Subject user is not logged in",
    );
  }

  // Get the experiment session
  const experimentSession = await ExperimentSessionDAO.findByUserAndExperiment(
    loggedInUser,
    {
      _id: new Types.ObjectId(experimentId),
    },
  );

  // Check if the experiment session exists
  if (!experimentSession) {
    throw new ApiError(
      API_ERROR_TYPES.NOT_FOUND,
      "Experiment session not found",
    );
  }

  // Check if experiment is completed
  if (
    experimentSession.isCompleted ||
    experimentSession.experiment_step >= numStimuli * numPerceptualDims - 1
  ) {
    throw new ApiError(
      API_ERROR_TYPES.VALIDATION_ERROR,
      "Invalid experiment step for response, the experiment session is completed",
    );
  }

  // Check if the perceptualDim provided is valid
  if (!perceptualDimensionsIds.includes(perceptualDimId)) {
    throw new ApiError(
      API_ERROR_TYPES.VALIDATION_ERROR,
      "The provided perceptual dimension is not valid for this experiment",
    );
  }

  // Add the response to the experiment session
  const trial_N = experimentSession.experiment_step; // this is 0 based counting
  const stimulus_N = experimentSession.experiment.stimuli[trial_N]._id;

  const experimentResponse: Omit<ExperimentResponse, "_id"> = {
    stimulus: stimulus_N,
    perceptualDimension: perceptualDimId,
    trial_N,
    responseMode,
    playCount,
    timeElapsed,
    response: responseVal,
  };

  // Call the addResponse method to update the session with the new response
  const updatedExperimentSession = await ExperimentSessionDAO.addResponse(
    experimentSession._id,
    experimentResponse as ExperimentResponse,
  );

  if (!updatedExperimentSession) {
    throw new ApiError(
      API_ERROR_TYPES.INTERNAL,
      "Failed to add response to experiment session",
    );
  }

  const responseData = {
    msg: "Response added successfully",
    updatedExperimentSession,
  };
  logger.info(responseData.msg, responseData.updatedExperimentSession);

  res.status(httpStatusCodes.OK).json(responseData);
}

// --- Experimenter ---

async function getCompletedByExperiment(
  req: Request,
  res: Response,
): Promise<void> {
  const experimentId = req.params.experimentId;

  // Retrieve all completed experiment sessions for the experiment
  const completedSessions = await ExperimentSessionDAO
    .findAllCompletedByExperiment({
      _id: new Types.ObjectId(experimentId),
    });

  const responseData = {
    msg:
      "Fetched all completed experiment-sessions for the selected experiment",
    completedSessions,
  };
  logger.info(responseData.msg, responseData.completedSessions);

  res.status(httpStatusCodes.OK).json(responseData);
}

async function getOngoingByExperiment(
  req: Request,
  res: Response,
): Promise<void> {
  const experimentId = req.params.experimentId;

  // Retrieve all completed experiment sessions for the experiment
  const ongoingSessions = await ExperimentSessionDAO.findAllOngoingByExperiment(
    {
      _id: new Types.ObjectId(experimentId),
    },
  );

  const responseData = {
    msg: "Fetched all ongoing experiment-sessions for the selected experiment",
    ongoingSessions,
  };
  logger.info(responseData.msg, responseData.ongoingSessions);

  res.status(httpStatusCodes.OK).json(responseData);
}

async function getResponsesBySessionId(
  req: Request,
  res: Response,
): Promise<void> {
  const sessionId = req.params.sessionId;

  // Retrieve all responses for the experiment-session
  const responses = await ExperimentSessionDAO.getResponsesBySessionId(
    new Types.ObjectId(sessionId),
  );

  const responseData = {
    msg: "Fetched all responses for the selected experiment-session",
    responses,
  };
  logger.info(responseData.msg, responseData.responses);

  res.status(httpStatusCodes.OK).json(responseData);
}

async function getResponsesByExperimentId(
  req: Request,
  res: Response,
): Promise<void> {
  const { experimentId } = req.params;

  // Retrieve all responses for the specified experiment
  const responses = await ExperimentSessionDAO.getResponsesByExperimentId(
    new Types.ObjectId(experimentId),
  );

  const responseData = {
    msg: "Fetched all responses for the specified experiment",
    responses,
  };
  logger.info(responseData.msg, responseData.responses);

  res.status(httpStatusCodes.OK).json(responseData);
}

async function getResponsesByUserAndExperiment(
  req: Request,
  res: Response,
): Promise<void> {
  const { experimentId, subjectId } = req.params;

  // Retrieve all response for the specified subject for the specified experiment
  const responses = await ExperimentSessionDAO.getResponsesByUserAndExperiment(
    new Types.ObjectId(experimentId),
    new Types.ObjectId(subjectId),
  );

  const responseData = {
    msg: "Fetched all responses for the specified user and experiment",
    responses,
  };
  logger.info(responseData.msg, responseData.responses);

  res.status(httpStatusCodes.OK).json(responseData);
}

async function getResponsesByPerceptDim(
  req: Request,
  res: Response,
): Promise<void> {
  const { perceptualDimId } = req.params;

  //  Retrieve all responses for the specified perceptual dimension
  const responses = await ExperimentSessionDAO.getResponsesByPerceptDim(
    new Types.ObjectId(perceptualDimId),
  );

  const responseData = {
    msg: "Fetched all responses for the selected perceptual dimension",
    responses,
  };
  logger.info(responseData.msg, responseData.responses);

  res.status(httpStatusCodes.OK).json(responseData);
}

async function getResponsesByPerceptDimAndExperiment(
  req: Request,
  res: Response,
): Promise<void> {
  const { perceptualDimId, experimentId } = req.params;

  //  Retrieve all responses for the specified perceptual dimension and experiment
  const responses = await ExperimentSessionDAO
    .getResponsesByPerceptDimAndExperiment(
      new Types.ObjectId(perceptualDimId),
      new Types.ObjectId(experimentId),
    );

  const responseData = {
    msg: "Fetched all responses for the selected perceptual dimension",
    responses,
  };
  logger.info(responseData.msg, responseData.responses);

  res.status(httpStatusCodes.OK).json(responseData);
}

export default {
  newSession,
  getAllByUser,
  respondSingle,
  getCompletedByExperiment,
  getOngoingByExperiment,
  getResponsesBySessionId,
  getResponsesByExperimentId,
  getResponsesByUserAndExperiment,
  getResponsesByPerceptDim,
  getResponsesByPerceptDimAndExperiment,
};
