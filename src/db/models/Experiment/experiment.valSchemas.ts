import mongoose from "mongoose";
import { z } from "zod";

const experimentBaseSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  experimenter: z.custom<mongoose.Types.ObjectId>().optional(),
  experimentSessions: z
    .array(z.custom<mongoose.Types.ObjectId>())
    .default([])
    .optional(),
  stimuli: z.array(z.custom<mongoose.Types.ObjectId>()).default([]).optional(),
  perceptualDimensions: z
    .array(z.custom<mongoose.Types.ObjectId>())
    .default([])
    .optional(),
});

export const experimentSchema = experimentBaseSchema.merge(
  z.object({
    _id: z.custom<mongoose.Types.ObjectId>(),
  }),
);

export interface Experiment extends z.infer<typeof experimentSchema> {}

export default { createExperiment: experimentBaseSchema };
