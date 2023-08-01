import { model, Schema } from "mongoose";
import { Response } from "./response.valSchemas.js";

export const DOCUMENT_NAME = "Response";
export const COLLECTION_NAME = "responses";

export const responseSchema = new Schema<Response>(
  {
    stimulus: { type: Schema.Types.ObjectId, ref: "Stimulus", required: true },
    perceptualDimension: {
      type: Schema.Types.ObjectId,
      ref: "PerceptualDimension",
      required: true,
    },
    trial_N: { type: Schema.Types.Number, required: true, min: 0 },
    responseMode: {
      type: Schema.Types.String,
      enum: ["slider", "arrows", "grid"],
      required: true,
    },
    playCount: { type: Schema.Types.Number, required: true, min: 0 },
    timeElapsed: { type: Schema.Types.Number, required: true },
    response: { type: Schema.Types.Number, required: true },
  },
  {
    timestamps: true,
    versionKey: true,
  },
);

export const ResponseModel = model<Response>(
  DOCUMENT_NAME,
  responseSchema,
  COLLECTION_NAME,
);
