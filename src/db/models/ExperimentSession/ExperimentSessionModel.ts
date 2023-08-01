import { model, Schema } from "mongoose";
import { ExperimentSession } from "./experimentSession.valSchemas.js";
import { responseSchema } from "../Response/ResponseModel.js";

export const DOCUMENT_NAME = "ExperimentSession";
export const COLLECTION_NAME = "experiment_sessions";

const experimentSessionSchema = new Schema<ExperimentSession>(
  {
    subject: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Reference to User model (Role=subject)
    experiment: {
      type: Schema.Types.ObjectId,
      ref: "Experiment",
      required: true,
    }, // Reference to Experiment model
    completed: { type: Schema.Types.Boolean, required: true },
    experiment_step: { type: Schema.Types.Number, required: true },
    stimuli_order: [{ type: Schema.Types.Number, required: true }],
    responses: [responseSchema],
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
