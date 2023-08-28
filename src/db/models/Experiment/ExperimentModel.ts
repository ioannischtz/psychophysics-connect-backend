import { model, Schema } from "mongoose";
import { Experiment } from "./experiment.valSchemas.js";

export const DOCUMENT_NAME = "Experiment";
export const COLLECTION_NAME = "experiments";

const experimentSchema = new Schema<Experiment>(
  {
    title: { type: Schema.Types.String },
    description: { type: Schema.Types.String },
    isActive: { type: Schema.Types.Boolean },
    experimenter: { type: Schema.Types.ObjectId, ref: "User" },
    experimentSessions: [
      { type: Schema.Types.ObjectId, ref: "ExperimentSession" },
    ],
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

experimentSchema.index({ _id: 1 });
experimentSchema.index({ title: 1 });
experimentSchema.index({ experimenter: 1 });
experimentSchema.index({ isActive: 1 });
experimentSchema.index({ experimenter: 1, isActive: 1 });

export const ExperimentModel = model<Experiment>(
  DOCUMENT_NAME,
  experimentSchema,
  COLLECTION_NAME,
);
