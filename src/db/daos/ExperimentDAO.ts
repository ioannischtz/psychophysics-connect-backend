import { Types } from "mongoose";
import { ExperimentModel } from "../models/Experiment/ExperimentModel.js";
import { Experiment } from "../models/Experiment/experiment.valSchemas.js";
import { User } from "../models/User/user.valSchemas.js";
import { ExperimentSession } from "../models/ExperimentSession/experimentSession.valSchemas.js";
import { Stimulus } from "../models/Stimulus/stimulus.valSchemas.js";
import { MediaAsset } from "../models/MediaAsset/mediaAsset.valSchemas.js";
import { PerceptualDimension } from "../models/PerceptualDimension/perceptualDimension.valSchemas.js";

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

interface ExperimentPopulated extends
  Omit<
    Experiment,
    "experimenter" | "experimentSessions" | "stimuli" | "perceptualDimensions"
  > {
  experimenter: ExperimenterPopulated;
  experimentSessions: ExperimentSessionPopulated[];
  stimuli: StimulusPopulated[];
  perceptualDimensions: PerceptualDimensionPopulated[];
}

interface ExperimenterPopulated
  extends Pick<Experimenter, "_id" | "username"> {}

interface ExperimentSessionPopulated
  extends Pick<ExperimentSession, "_id" | "experiment_step"> {}

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

async function deleteById(id: Types.ObjectId): Promise<boolean> {
  const deleted = await ExperimentModel.findOneAndDelete({ _id: id })
    .lean()
    .exec();
  return !!deleted;
}

async function findById(
  id: Types.ObjectId,
): Promise<ExperimentPopulated | null> {
  const result = await ExperimentModel.findOne({
    _id: id,
  })
    .populate(getPopulateOptions())
    .lean()
    .exec();
  return result as ExperimentPopulated | null;
}

async function findByTitle(title: string): Promise<ExperimentPopulated | null> {
  const result = await ExperimentModel.findOne({ title: title })
    .populate(getPopulateOptions())
    .lean()
    .exec();
  return result as ExperimentPopulated | null;
}

// ---------------
// ---- Many ----
// ---------------

// dont populate

type ExperimentPopedUser = Omit<Experiment, "experimenter"> & {
  experimenter: ExperimenterPopulated;
};
async function findAllByUser(
  user: Experimenter,
): Promise<ExperimentPopedUser[]> {
  const result = await ExperimentModel.find({ experimenter: user })
    .populate("experimenter", EXPERIMENTER_FIELDS)
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
  return result as ExperimentPopedUser[];
}

// populate

// potential issue, with return type
async function findAllByUserPopulated(
  user: Experimenter,
): Promise<Experiment[]> {
  return ExperimentModel.find({ experimenter: user })
    .populate(getPopulateOptions())
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

type ExperimentPopedPerceptualDimension =
  & Omit<
    Experiment,
    "perceptualDimension"
  >
  & {
    perceptualDimension: PerceptualDimensionPopulated;
  };
async function findAllByPerceptualDimension(
  perceptualDimensionId: Types.ObjectId,
): Promise<ExperimentPopedPerceptualDimension[]> {
  const result = await ExperimentModel.find({
    perceptualDimensions: perceptualDimensionId,
  })
    .populate({
      path: "perceptualDimensions",
      select: PERCEPTUALDIMENSIONS_FIELDS,
    })
    .sort({ updatedAt: -1 })
    .lean()
    .exec();

  return result as ExperimentPopedPerceptualDimension[];
}

async function findAllActive(): Promise<Experiment[]> {
  return ExperimentModel.find({ isActive: true })
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

// potential issue with return type
async function findAllActivePopulated(): Promise<Experiment[]> {
  return ExperimentModel.find({ isActive: true })
    .populate(getPopulateOptions())
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

async function findAllActiveByUser(
  user: Experimenter,
): Promise<ExperimentPopedUser[]> {
  const result = await ExperimentModel.find({
    experimenter: user,
    isActive: true,
  })
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
  return result as ExperimentPopedUser[];
}

export default {
  create,
  update,
  deleteById,
  findById,
  findByTitle,
  findAllByUser,
  findAllByUserPopulated,
  findAllByPerceptualDimension,
  findAllActive,
  findAllActivePopulated,
  findAllActiveByUser,
};
