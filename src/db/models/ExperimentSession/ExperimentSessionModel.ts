import { model, Schema } from "mongoose";
import { ExperimentSession } from "./experimentSession.valSchemas.js";

export const DOCUMENT_NAME = "ExperimentSession";
export const COLLECTION_NAME = "experiment_sessions";

const experimentSessionSchema = new Schema<ExperimentSession>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Reference to UserModel
    completed: { type: Schema.Types.Boolean, required: true },
    experiment_step: { type: Schema.Types.Number, required: true },
    stimuli_order: [{ type: Schema.Types.Number, required: true }],
    stimuli_ids: [
      { type: Schema.Types.ObjectId, required: true, ref: "Stimulus" },
    ],
  },
  {
    timestamps: true,
    versionKey: true,
  },
);

export const ExperimentSessionModel = model<ExperimentSession>(
  DOCUMENT_NAME,
  experimentSessionSchema,
  COLLECTION_NAME,
);
