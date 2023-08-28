import { Types } from "mongoose";
import { ExperimentSession } from "../models/ExperimentSession/experimentSession.valSchemas.js";
import { ExperimentSessionModel } from "../models/ExperimentSession/ExperimentSessionModel.js";
import { User } from "../models/User/user.valSchemas.js";
import { Experiment } from "../models/Experiment/experiment.valSchemas.js";
import { Response } from "../models/Response/response.valSchemas.js";
import { Stimulus } from "../models/Stimulus/stimulus.valSchemas.js";
import { MediaAsset } from "../models/MediaAsset/mediaAsset.valSchemas.js";
import { PerceptualDimension } from "../models/PerceptualDimension/perceptualDimension.valSchemas.js";

export interface Subject extends Omit<User, "role"> {
  role: "subject";
}

const SUBJECT_FIELDS = "_id username";
const EXPERIMENT_FIELDS = "_id title description";
const STIMULI_FIELDS = "_id title type description";
const PERCEPTUALDIMENSIONS_FIELDS = "_id title type description";
const MEDIAASSET_FIELDS = "_id mimetype filename";

function getPopulateOptions() {
  return [
    { path: "subject", select: SUBJECT_FIELDS },
    {
      path: "experiment",
      select: EXPERIMENT_FIELDS,
      populate: [
        {
          path: "stimuli",
          select: STIMULI_FIELDS,
          populate: {
            path: "mediaAsset", // Corrected typo here
            select: MEDIAASSET_FIELDS,
          },
        },
        {
          path: "perceptualDimensions",
          select: PERCEPTUALDIMENSIONS_FIELDS,
          populate: {
            path: "mediaAssets",
            select: MEDIAASSET_FIELDS,
          },
        },
      ],
    },
  ];
}

export interface ExperimentSessionPopulated
  extends Omit<ExperimentSession, "subject" | "experiment"> {
  subject: SubjectPopulated;
  experiment: ExperimentPopulated;
}

interface SubjectPopulated extends Pick<Subject, "_id" | "username"> {}

interface ExperimentPopulated
  extends Pick<Experiment, "_id" | "title" | "description"> {
  stimuli: StimulusPopulated[];
  perceptualDimensions: PerceptualDimensionPopulated[];
}

interface StimulusPopulated
  extends Pick<Stimulus, "_id" | "title" | "type" | "description"> {
  mediaAsset: MediaAssetPopulated;
}

interface PerceptualDimensionPopulated
  extends Pick<PerceptualDimension, "_id" | "title" | "type" | "description"> {
  mediaAssets: MediaAssetPopulated[];
}

interface MediaAssetPopulated
  extends Pick<MediaAsset, "_id" | "mimetype" | "filename"> {}

// ---------------
// ---- Single ----
// ---------------

async function create(session: ExperimentSession): Promise<ExperimentSession> {
  const createdSession = await ExperimentSessionModel.create(session);
  return createdSession.toObject();
}

async function update(
  session: ExperimentSession,
): Promise<ExperimentSession | null> {
  return ExperimentSessionModel.findByIdAndUpdate(
    session._id,
    { $set: { ...session } },
    { new: true },
  );
}

async function findById(
  id: Types.ObjectId,
): Promise<ExperimentSessionPopulated | null> {
  const result = await ExperimentSessionModel.findOne({ _id: id })
    .populate(getPopulateOptions())
    .lean()
    .exec();

  return result as ExperimentSessionPopulated | null;
}

async function findCompletedById(
  id: Types.ObjectId,
): Promise<ExperimentSessionPopulated | null> {
  const result = await ExperimentSessionModel.findOne({
    _id: id,
    isCompleted: true,
  })
    .populate(getPopulateOptions())
    .lean()
    .exec();

  return result as ExperimentSessionPopulated | null;
}

async function findByUserAndExperiment(
  user: Subject,
  experiment: Experiment,
): Promise<ExperimentSessionPopulated | null> {
  const result = await ExperimentSessionModel.findOne({
    subject: user,
    experiment,
  })
    // .populate({ path: "subject", select: SUBJECT_FIELDS })
    // .populate({
    //   path: "experiment",
    //   select: EXPERIMENT_FIELDS,
    // })
    // .populate({
    //   path: "experiment.stimuli",
    //   select: STIMULI_FIELDS,
    //   populate: {
    //     path: "mediaAsset",
    //     select: MEDIAASSET_FIELDS,
    //   },
    // })
    // .populate({
    //   path: "experiment.perceptualDimensions",
    //   select: PERCEPTUALDIMENSIONS_FIELDS,
    //   populate: {
    //     path: "mediaAssets",
    //     select: MEDIAASSET_FIELDS,
    //   },
    // })
    // .lean()
    // .exec();
    .populate(getPopulateOptions())
    .lean()
    .exec();

  return result as ExperimentSessionPopulated | null;
}

// ---------------
// ---- Many ----
// ---------------
export type ExperimentSessionPopedUser = Omit<ExperimentSession, "subject"> & {
  subject: SubjectPopulated;
};
async function findAllByUser(
  user: Subject,
): Promise<ExperimentSessionPopedUser[]> {
  return ExperimentSessionModel.find({ subject: user })
    .populate("subject", SUBJECT_FIELDS)
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}
export type ExperimentSessionPopedExperiment =
  & Omit<
    ExperimentSession,
    "experiment"
  >
  & {
    experiment: Pick<Experiment, "_id" | "title" | "description">;
  };
async function findAllByExperiment(
  experiment: Experiment,
): Promise<ExperimentSessionPopedExperiment[]> {
  return ExperimentSessionModel.find({ experiment })
    .populate("experiment", EXPERIMENT_FIELDS)
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

async function findAllCompleted(): Promise<ExperimentSession[]> {
  return ExperimentSessionModel.find({ isCompleted: true })
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

async function findAllCompletedByExperiment(
  experiment: Experiment,
): Promise<ExperimentSessionPopedExperiment[]> {
  return ExperimentSessionModel.find({ experiment, isCompleted: true })
    .populate("experiment", EXPERIMENT_FIELDS)
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

async function findAllOngoing(): Promise<ExperimentSession[]> {
  return ExperimentSessionModel.find({ experiment_step: { $gt: 0 } })
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

async function findAllOngoingByExperiment(
  experiment: Experiment,
): Promise<ExperimentSessionPopedExperiment[]> {
  return ExperimentSessionModel.find({
    experiment,
    experiment_step: { $gt: 0 },
  })
    .populate("experiment", EXPERIMENT_FIELDS)
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

// -----------------
// ---- Response ----
// -----------------

// ---- Single ----

// Add a response to an experiment-session and return the updated session
async function addResponse(
  experimentSessionId: Types.ObjectId,
  response: Response,
): Promise<ExperimentSession | null> {
  return await ExperimentSessionModel.findOneAndUpdate(
    { _id: experimentSessionId },
    {
      $push: { responses: response },
      $set: {
        experiment_step: { $add: ["$experiment_step", 1] }, // Increment experiment_step by 1
        isCompleted: {
          $gte: [
            { $add: ["$experiment_step", 1] },
            {
              $subtract: [
                {
                  $multiply: [
                    "$experiment.stimuli.length",
                    "$experiment.perceptualDimensions.length",
                  ],
                },
                1,
              ],
            },
          ],
        },
      },
    },
    { new: true },
  );
}

// ---- Many ----

// Get all responses associated with an experiment-session
async function getResponsesBySessionId(
  experimentSessionId: Types.ObjectId,
): Promise<Response[]> {
  const session = await ExperimentSessionModel.findById(
    experimentSessionId,
  ).select("responses");
  return session ? session.responses : [];
}

// Count the number od responses associated with an experiment-session
async function countResponsesBySessionId(
  experimentSessionId: Types.ObjectId,
): Promise<number> {
  const session = await ExperimentSessionModel.findById(
    experimentSessionId,
  ).select("responses");
  return session ? session.responses.length : 0;
}

// Get all responses associated with a specific experiment
async function getResponsesByExperimentId(
  experimentId: Types.ObjectId,
): Promise<Response[]> {
  const sessions = await ExperimentSessionModel.find({
    experiment: experimentId,
  }).select("responses");
  return sessions.reduce(
    (responses: Response[], session: ExperimentSession) => {
      responses.push(...session.responses);
      return responses;
    },
    [],
  );
}

// Get all responses associated with a specific user(subject)
async function getResponsesByUser(userId: Types.ObjectId): Promise<Response[]> {
  const sessions = await ExperimentSessionModel.find({
    subject: userId,
  }).select("responses");
  return sessions.reduce(
    (responses: Response[], session: ExperimentSession) => {
      responses.push(...session.responses);
      return responses;
    },
    [],
  );
}

// Get all responses associated with a specific user and experiment
async function getResponsesByUserAndExperiment(
  userId: Types.ObjectId,
  experimentId: Types.ObjectId,
): Promise<Response[]> {
  const sessions = await ExperimentSessionModel.find({
    subject: userId,
    experiment: experimentId,
  }).select("responses");
  return sessions.reduce(
    (responses: Response[], session: ExperimentSession) => {
      responses.push(...session.responses);
      return responses;
    },
    [],
  );
}

// Get all responses associated with a specific perceptual-dimension
async function getResponsesByPerceptDim(
  perceptualDimensionId: Types.ObjectId,
): Promise<Response[]> {
  const sessions = await ExperimentSessionModel.find({
    "responses.perceptualDimension": perceptualDimensionId,
  }).select("responses");
  return sessions.reduce(
    (responses: Response[], session: ExperimentSession) => {
      responses.push(...session.responses);
      return responses;
    },
    [],
  );
}

// Get all responses associated with a specific perceptual-dimension and experiment
async function getResponsesByPerceptDimAndExperiment(
  perceptualDimensionId: Types.ObjectId,
  experimentId: Types.ObjectId,
): Promise<Response[]> {
  const sessions = await ExperimentSessionModel.find({
    experiment: experimentId,
    "responses.perceptualDimension": perceptualDimensionId,
  }).select("responses");
  return sessions.reduce(
    (responses: Response[], session: ExperimentSession) => {
      responses.push(...session.responses);
      return responses;
    },
    [],
  );
}

// Get all responses associated with a specific perceptual-dimension and experiment-session
async function getResponsesByPerceptDimAndSessionId(
  perceptualDimensionId: Types.ObjectId,
  experimentSessionId: Types.ObjectId,
): Promise<Response[]> {
  const session = await ExperimentSessionModel.findById(
    experimentSessionId,
  ).select("responses");
  return session
    ? session.responses.filter(
      (response: Response) =>
        response.perceptualDimension === perceptualDimensionId,
    )
    : [];
}

export default {
  create,
  update,
  findById,
  findCompletedById,
  findByUserAndExperiment,
  findAllByUser,
  findAllByExperiment,
  findAllCompleted,
  findAllCompletedByExperiment,
  findAllOngoing,
  findAllOngoingByExperiment,
  addResponse,
  getResponsesBySessionId,
  countResponsesBySessionId,
  getResponsesByExperimentId,
  getResponsesByUser,
  getResponsesByUserAndExperiment,
  getResponsesByPerceptDim,
  getResponsesByPerceptDimAndExperiment,
  getResponsesByPerceptDimAndSessionId,
};
