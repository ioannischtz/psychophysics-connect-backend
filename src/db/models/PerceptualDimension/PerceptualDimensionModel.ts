import { model, Schema } from "mongoose";
import { PerceptualDimension } from "./perceptualDimension.valSchemas.js";

export const DOCUMENT_NAME = "PerceptualDimension";
export const COLLECTION_NAME = "perceptual_dimensions";

const perceptualDimensionSchema = new Schema<PerceptualDimension>(
  {
    title: { type: Schema.Types.String },
    type: {
      type: Schema.Types.String,
      enum: ["text", "img", "audio"],
      required: true,
    },
    description: { type: Schema.Types.String, required: false },
    mediaAssets: [
      {
        type: Schema.Types.ObjectId,
        ref: "MediaAsset",
      },
    ],
    experiments: [{ type: Schema.Types.ObjectId, ref: "Experiment" }],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

perceptualDimensionSchema.index({ _id: 1 });
perceptualDimensionSchema.index({ title: 1 });
perceptualDimensionSchema.index({ type: 1 });

export const PerceptualDimensionModel = model<PerceptualDimension>(
  DOCUMENT_NAME,
  perceptualDimensionSchema,
  COLLECTION_NAME,
);
