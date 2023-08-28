import { Types } from "mongoose";
import { Stimulus } from "../models/Stimulus/stimulus.valSchemas.js";
import { StimulusModel } from "../models/Stimulus/StimulusModel.js";
import { MediaAsset } from "../models/MediaAsset/mediaAsset.valSchemas.js";

const STIMULUS_FIELDS = "_id title type description";
const MEDIAASSET_FIELDS = "_id mimetype filename";
const EXPERIMENTS_FIELDS = "_id title description isActive";

export type StimulusType = "text" | "img" | "audio";

function getPopulateOptions() {
  return [
    { path: "mediaAsset", select: MEDIAASSET_FIELDS },
    { path: "experiments", select: EXPERIMENTS_FIELDS },
  ];
}

// ---------------
// ---- Single ----
// ---------------

async function create(stimulus: Stimulus): Promise<Stimulus | null> {
  const createdStimulus = await StimulusModel.create(stimulus);
  return createdStimulus.toObject();
}

export type OptionalStimulus = Omit<Partial<Stimulus>, "_id"> & {
  _id: Types.ObjectId;
};
async function update(stimulus: OptionalStimulus): Promise<Stimulus | null> {
  return StimulusModel.findByIdAndUpdate(
    stimulus._id,
    { $set: { ...stimulus } },
    { new: true },
  );
}

async function deleteById(id: Types.ObjectId): Promise<boolean> {
  const deleted = await StimulusModel.findOneAndDelete({ _id: id })
    .lean()
    .exec();
  return !!deleted;
}

async function findById(id: Types.ObjectId): Promise<Stimulus | null> {
  return StimulusModel.findOne({ _id: id })
    .populate(getPopulateOptions())
    .lean()
    .exec();
}

async function findByTitle(title: string): Promise<Stimulus | null> {
  return StimulusModel.findOne({ title: title })
    .populate(getPopulateOptions())
    .lean()
    .exec();
}

// ---------------
// ---- Many ----
// ---------------

// don't populate

async function findAllByType(type: StimulusType): Promise<Stimulus[]> {
  return StimulusModel.find({ type: type })
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

async function findAllByMediaAsset(
  mediaAsset: MediaAsset,
): Promise<Stimulus[]> {
  return StimulusModel.find({ mediaAsset: mediaAsset })
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

async function findAllByExperimentId(
  experimentId: Types.ObjectId,
): Promise<Stimulus[]> {
  return StimulusModel.find({ experiments: experimentId })
    .populate({
      path: "experiments",
      select: EXPERIMENTS_FIELDS,
    })
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

export default {
  create,
  update,
  deleteById,
  findById,
  findByTitle,
  findAllByType,
  findAllByMediaAsset,
  findAllByExperimentId,
};
