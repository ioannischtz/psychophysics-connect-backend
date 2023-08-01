import { z } from "zod";
import mongoose from "mongoose";

const stimulusBaseSchema = z.object({
  title: z.string().nonempty(),
  type: z.enum(["text", "img", "audio"]),
  description: z.string().optional(),
  mediaAsset: z.custom<mongoose.Types.ObjectId>(),
  experiments: z.array(z.custom<mongoose.Types.ObjectId>()),
});

export const stimulusSchemaWithId = stimulusBaseSchema.merge(
  z.object({
    _id: z.string().optional(),
  }),
);

export type Stimulus = z.infer<typeof stimulusSchemaWithId>;

const createStimulus = stimulusBaseSchema.pick({
  title: true,
  type: true,
  description: true,
  mediaAsset: true,
});

export default { createStimulus };
