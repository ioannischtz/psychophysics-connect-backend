import { Types } from "mongoose";
import { PerceptualDimension } from "../models/PerceptualDimension/perceptualDimension.valSchemas.js";
import { PerceptualDimensionModel } from "../models/PerceptualDimension/PerceptualDimensionModel.js";

const PERCEPTUAL_DIMENSION_FIELDS = "_id title type description";
const MEDIAASSETS_FIELDS = "_id mimetype filename";
const EXPERIMENTS_FIELDS = "_id title description isActive";

type PerceptualDimensionType = "text" | "img" | "audio";

function getPopulateOptions() {
  return [
    { path: "mediaAssets", select: MEDIAASSETS_FIELDS },
    { path: "experiments", select: EXPERIMENTS_FIELDS },
  ];
} // ---------------
// ---- Single ----
// ---------------

async function create(
  perceptualDimension: PerceptualDimension,
): Promise<PerceptualDimension | null> {
  const createdPerceptualDimension = await PerceptualDimensionModel.create(
    perceptualDimension,
  );
  return createdPerceptualDimension.toObject();
}

export type OptionalPerceptualDimension =
  & Omit<
    Partial<PerceptualDimension>,
    "_id"
  >
  & {
    _id: Types.ObjectId;
  };
async function update(
  perceptualDimension: OptionalPerceptualDimension,
): Promise<PerceptualDimension | null> {
  return PerceptualDimensionModel.findByIdAndUpdate(
    perceptualDimension._id,
    { $set: { ...perceptualDimension } },
    { new: true },
  );
}

async function deleteById(id: Types.ObjectId): Promise<boolean> {
  const deleted = await PerceptualDimensionModel.findOneAndDelete({ _id: id })
    .lean()
    .exec();

  return !!deleted;
}

async function findById(
  id: Types.ObjectId,
): Promise<PerceptualDimension | null> {
  return PerceptualDimensionModel.findOne({ _id: id })
    .populate(getPopulateOptions())
    .lean()
    .exec();
}

async function findByTitle(title: string): Promise<PerceptualDimension | null> {
  return PerceptualDimensionModel.findOne({ title: title })
    .populate(getPopulateOptions())
    .lean()
    .exec();
}

// ---------------
// ---- Many ----
// ---------------

// don't populate

async function findAllByType(
  type: PerceptualDimensionType,
): Promise<PerceptualDimension[]> {
  return PerceptualDimensionModel.find({ type: type })
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

async function findAllByMediaAssetId(
  mediaAssetId: Types.ObjectId,
): Promise<PerceptualDimension[]> {
  return PerceptualDimensionModel.find({ mediaAssets: mediaAssetId })
    .populate({
      path: "mediaAssets",
      select: MEDIAASSETS_FIELDS,
    })
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

async function findAllByExperimentId(
  experimentId: Types.ObjectId,
): Promise<PerceptualDimension[]> {
  return PerceptualDimensionModel.find({ experiments: experimentId })
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
  findAllByMediaAssetId,
  findAllByExperimentId,
};
