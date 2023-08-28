import { z } from "zod";
import mongoose from "mongoose";

const stimulusBaseSchema = z.object({
  title: z.string().optional(),
  type: z.enum(["text", "img", "audio"]),
  description: z.string().optional(),
  mediaAsset: z.custom<mongoose.Types.ObjectId>().optional(),
  experiments: z.array(z.custom<mongoose.Types.ObjectId>()).default([]),
});

export const stimulusSchemaWithId = stimulusBaseSchema.merge(
  z.object({
    _id: z.custom<mongoose.Types.ObjectId>(),
  }),
);

export interface Stimulus extends z.infer<typeof stimulusSchemaWithId> {}

const createStimulus = stimulusBaseSchema.pick({
  title: true,
  type: true,
  description: true,
  mediaAsset: true,
  experiments: true,
});

export default { createStimulus };
