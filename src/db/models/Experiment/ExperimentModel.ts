import { model, Schema } from "mongoose";
import { Experiment } from "./experiment.valSchemas.js";

export const DOCUMENT_NAME = "Experiment";
export const COLLECTION_NAME = "experiments";

const experimentSchema = new Schema<Experiment>(
  {
    title: { type: Schema.Types.String, required: true },
    description: { type: Schema.Types.String, required: true },
    isActive: { type: Schema.Types.Boolean, required: true },
    experimenter: { type: Schema.Types.ObjectId, ref: "User", required: true },
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

export const ExperimentModel = model<Experiment>(
  DOCUMENT_NAME,
  experimentSchema,
  COLLECTION_NAME,
);
