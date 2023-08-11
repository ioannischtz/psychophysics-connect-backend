import { Types } from "mongoose";
import { MediaAssetModel } from "../models/MediaAsset/MediaAssetModel.js";
import { MediaAsset } from "../models/MediaAsset/mediaAsset.valSchemas.js";
import { MIMEtypes } from "mimetypes.js";

const MEDIAASSET_FIELDS = "_id mimetype filename";
const STIMULI_FIELDS = "_id title type description";
const PERCEPTUAL_DIMENSIONS_FIELDS = "_id title type description";

type MediaAssetType = "text" | "img" | "audio";

function getPopulateOptions() {
  return [
    { path: "stimuli", select: STIMULI_FIELDS },
    { path: "perceptualDimensions", select: PERCEPTUAL_DIMENSIONS_FIELDS },
  ];
}

// ---------------
// ---- Single ----
// ---------------

async function create(stimulus: MediaAsset): Promise<MediaAsset | null> {
  const createdMediaAsset = await MediaAssetModel.create(stimulus);
  return createdMediaAsset.toObject();
}

async function update(stimulus: MediaAsset): Promise<MediaAsset | null> {
  return MediaAssetModel.findByIdAndUpdate(
    stimulus._id,
    { $set: { ...stimulus } },
    { new: true },
  );
}

async function deleteById(id: Types.ObjectId): Promise<boolean> {
  const deleted = await MediaAssetModel.findOneAndDelete({ _id: id })
    .lean()
    .exec();
  return !!deleted;
}

async function findById(id: Types.ObjectId): Promise<MediaAsset | null> {
  return MediaAssetModel.findOne({ _id: id })
    .populate(getPopulateOptions())
    .lean()
    .exec();
}

async function findByFilename(filename: string): Promise<MediaAsset | null> {
  return MediaAssetModel.findOne({ filename: filename })
    .populate(getPopulateOptions())
    .lean()
    .exec();
}

async function findByStimulusId(
  stimulusId: Types.ObjectId,
): Promise<MediaAsset | null> {
  return MediaAssetModel.findOne({ stimuli: stimulusId })
    .populate(getPopulateOptions())
    .lean()
    .exec();
}

// ---------------
// ---- Many ----
// ---------------

// don't populate

async function findAllByMimetype(mimetype: MIMEtypes): Promise<MediaAsset[]> {
  return MediaAssetModel.find({ mimetype: mimetype })
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

async function findAllByPerceptualDimension(
  perceptualDimensionId: Types.ObjectId,
): Promise<MediaAsset[]> {
  return MediaAssetModel.find({
    perceptualDimensions: perceptualDimensionId,
  })
    .populate({
      path: "perceptualDimensions",
      select: PERCEPTUAL_DIMENSIONS_FIELDS,
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
  findByFilename,
  findByStimulusId,
  findAllByMimetype,
  findAllByPerceptualDimension,
};
