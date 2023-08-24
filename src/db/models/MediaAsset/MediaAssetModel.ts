import { model, Schema } from "mongoose";
import { MediaAsset } from "./mediaAsset.valSchemas.js";
import { mimeTypes } from "./MimeTypes.js";

export const DOCUMENT_NAME = "MediaAsset";
export const COLLECTION_NAME = "media_assets";

const mediaAssetSchema = new Schema<MediaAsset>(
  {
    mimetype: {
      type: Schema.Types.String,
      enum: mimeTypes,
    },
    filename: {
      type: Schema.Types.String,
    },
    stimuli: [{ type: Schema.Types.ObjectId, ref: "Stimulus" }],
    perceptualDimensions: [
      { type: Schema.Types.ObjectId, ref: "PerceptualDimension" },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

mediaAssetSchema.index({ mimetype: 1 });
mediaAssetSchema.index({ filename: 1 });

export const MediaAssetModel = model<MediaAsset>(
  DOCUMENT_NAME,
  mediaAssetSchema,
  COLLECTION_NAME,
);
