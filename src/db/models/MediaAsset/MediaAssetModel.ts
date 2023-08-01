import { model, Schema } from "mongoose";
import { MediaAsset } from "./mediaAsset.valSchemas.js";

export const DOCUMENT_NAME = "MediaAsset";
export const COLLECTION_NAME = "media_assets";

const mediaAssetSchema = new Schema<MediaAsset>(
  {
    mimetype: { type: Schema.Types.String, required: true },
    filename: {
      type: Schema.Types.String,
      required: true,
    },
    stimuli: [{ type: Schema.Types.ObjectId, ref: "Stimulus" }],
    perceptualDimensions: [
      { type: Schema.Types.ObjectId, ref: "PerceptualDimension" },
    ],
  },
  {
    timestamps: true,
    versionKey: true,
  },
);

export const MediaAssetModel = model<MediaAsset>(
  DOCUMENT_NAME,
  mediaAssetSchema,
  COLLECTION_NAME,
);
