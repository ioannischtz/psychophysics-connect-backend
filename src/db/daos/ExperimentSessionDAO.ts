import { Types } from "mongoose";
import { ExperimentSession } from "../models/ExperimentSession/experimentSession.valSchemas.js";
import { ExperimentSessionModel } from "../models/ExperimentSession/ExperimentSessionModel.js";
import { User } from "../models/User/user.valSchemas.js";
import { Experiment } from "../models/Experiment/experiment.valSchemas.js";

type Subject = Omit<User, "role"> & { role: "subject" };

const SUBJECT_FIELDS = "username";
const EXPERIMENT_FIELDS = "title description";
const STIMULI_FIELDS = "title type description";
const PERCEPTUALDIMENSIONS_FIELDS = "title type description";
const MEDIAASSET_FIELDS = "mimetype filename";

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

async function findById(id: Types.ObjectId): Promise<ExperimentSession | null> {
  return ExperimentSessionModel.findOne({ _id: id })
    .populate(getPopulateOptions())
    .lean()
    .exec();
}

async function findCompletedById(
  id: Types.ObjectId,
): Promise<ExperimentSession | null> {
  return ExperimentSessionModel.findOne({ _id: id, isCompleted: true })
    .populate(getPopulateOptions())
    .lean()
    .exec();
}

async function findByUserAndExperiment(
  user: Subject,
  experiment: Experiment,
): Promise<ExperimentSession | null> {
  return ExperimentSessionModel.findOne({ subject: user, experiment })
    .populate(getPopulateOptions())
    .lean()
    .exec();
}

// ---------------
// ---- Many ----
// ---------------

async function findAllByUser(user: Subject): Promise<ExperimentSession[]> {
  return ExperimentSessionModel.find({ subject: user })
    .populate("subject", SUBJECT_FIELDS)
    .populate(getPopulateOptions())
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

async function findAllByExperiment(
  experiment: Experiment,
): Promise<ExperimentSession[]> {
  return ExperimentSessionModel.find({ experiment })
    .populate(getPopulateOptions())
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

async function findAllCompleted(): Promise<ExperimentSession[]> {
  return ExperimentSessionModel.find({ isCompleted: true })
    .populate(getPopulateOptions())
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

async function findAllCompletedByExperiment(
  experiment: Experiment,
): Promise<ExperimentSession[]> {
  return ExperimentSessionModel.find({ experiment, isCompleted: true })
    .populate(getPopulateOptions())
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

async function findAllOngoing(): Promise<ExperimentSession[]> {
  return ExperimentSessionModel.find({ experiment_step: { $gt: 0 } })
    .populate(getPopulateOptions())
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

async function findAllOngoingByExperiment(
  experiment: Experiment,
): Promise<ExperimentSession[]> {
  return ExperimentSessionModel.find({
    experiment,
    experiment_step: { $gt: 0 },
  })
    .populate(getPopulateOptions())
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}
