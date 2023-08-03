import mongoose from "mongoose";
import { z } from "zod";

const experimentBaseSchema = z.object({
  title: z.string(),
  description: z.string(),
  isActive: z.boolean(),
  experimenter: z.custom<mongoose.Types.ObjectId>(),
  experimentSessions: z.array(z.custom<mongoose.Types.ObjectId>()),
  stimuli: z.array(z.custom<mongoose.Types.ObjectId>()),
  perceptualDimensions: z.array(z.custom<mongoose.Types.ObjectId>()),
});

export const experimentSchema = experimentBaseSchema.merge(
  z.object({
    _id: z.custom<mongoose.Types.ObjectId>().optional(),
  }),
);

export type Experiment = z.infer<typeof experimentSchema>;

export default { createExperiment: experimentBaseSchema };
