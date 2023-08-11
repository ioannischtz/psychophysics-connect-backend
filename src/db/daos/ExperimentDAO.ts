import { Types } from "mongoose";
import { ExperimentModel } from "../models/Experiment/ExperimentModel.js";
import { Experiment } from "../models/Experiment/experiment.valSchemas.js";
import { User } from "../models/User/user.valSchemas.js";

type Experimenter = Omit<User, "role"> & { role: "experimenter" };

// ---------------
// ---- Single ----
// ---------------

const EXPERIMENTER_FIELDS = "_id username";
const EXPERIMENT_SESSION_FIELDS = "_id experiment_step";
const STIMULI_FIELDS = "_id title type description";
const PERCEPTUALDIMENSIONS_FIELDS = "_id title type description";
const MEDIAASSET_FIELDS = "_id mimetype filename";

function getPopulateOptions() {
  return [
    { path: "experimenter", select: EXPERIMENTER_FIELDS },
    { path: "experimentSessions", select: EXPERIMENT_SESSION_FIELDS },
    {
      path: "stimuli",
      select: STIMULI_FIELDS,
      populate: {
        path: "mediaAsset",
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
  ];
}

async function create(experiment: Experiment): Promise<Experiment> {
  const createdExperiment = await ExperimentModel.create(experiment);
  return createdExperiment.toObject();
}

async function update(experiment: Experiment): Promise<Experiment | null> {
  return ExperimentModel.findByIdAndUpdate(
    experiment._id,
    { $set: { ...experiment } },
    { new: true },
  );
}

async function findById(id: Types.ObjectId): Promise<Experiment | null> {
  return ExperimentModel.findOne({
    _id: id,
  })
    .populate(getPopulateOptions())
    .lean()
    .exec();
}

async function findByTitle(title: string): Promise<Experiment | null> {
  return ExperimentModel.findOne({ title: title })
    .populate(getPopulateOptions())
    .lean()
    .exec();
}

// ---------------
// ---- Many ----
// ---------------

// dont populate
async function findAllByUser(user: Experimenter): Promise<Experiment[]> {
  return ExperimentModel.find({ experimenter: user })
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

// populate
async function findAllByUserPopulated(
  user: Experimenter,
): Promise<Experiment[]> {
  return ExperimentModel.find({ experimenter: user })
    .populate(getPopulateOptions())
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

async function findAllByPerceptualDimension(
  perceptualDimensionId: Types.ObjectId,
): Promise<Experiment[]> {
  return ExperimentModel.find({
    perceptualDimensions: perceptualDimensionId,
  })
    .populate({
      path: "perceptualDimensions",
      select: PERCEPTUALDIMENSIONS_FIELDS,
    })
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

async function findAllActive(): Promise<Experiment[]> {
  return ExperimentModel.find({ isActive: true })
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

async function findAllActivePopulated(): Promise<Experiment[]> {
  return ExperimentModel.find({ isActive: true })
    .populate(getPopulateOptions())
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

async function findAllActiveByUser(user: Experimenter): Promise<Experiment[]> {
  return ExperimentModel.find({ experimenter: user, isActive: true })
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

export default {
  create,
  update,
  findById,
  findByTitle,
  findAllByUser,
  findAllByUserPopulated,
  findAllByPerceptualDimension,
  findAllActive,
  findAllActivePopulated,
  findAllActiveByUser,
};
