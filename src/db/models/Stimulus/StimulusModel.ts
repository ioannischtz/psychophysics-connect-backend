import { model, Schema } from "mongoose";
import { Stimulus } from "./stimulus.valSchemas.js";

export const DOCUMENT_NAME = "Stimulus";
export const COLLECTION_NAME = "stimuli";

const stimulusSchema = new Schema<Stimulus>(
  {
    title: { type: Schema.Types.String },
    type: {
      type: Schema.Types.String,
      enum: ["text", "img", "audio"],
    },
    description: { type: Schema.Types.String },
    mediaAsset: {
      type: Schema.Types.ObjectId,
      ref: "MediaAsset",
    },
    experiments: [{ type: Schema.Types.ObjectId, ref: "Experiment" }],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

stimulusSchema.index({ _id: 1 });
stimulusSchema.index({ title: 1 });
stimulusSchema.index({ type: 1 });
stimulusSchema.index({ mediaAsset: 1 });

export const StimulusModel = model<Stimulus>(
  DOCUMENT_NAME,
  stimulusSchema,
  COLLECTION_NAME,
);
