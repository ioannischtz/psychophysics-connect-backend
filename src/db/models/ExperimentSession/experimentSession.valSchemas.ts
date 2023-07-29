import { object, string, z } from "zod";
import mongoose from "mongoose";

const experimentSessionBaseSchema = object({
  user: z.custom<mongoose.Types.ObjectId>(),
  completed: z.boolean(),
  experiment_step: z.number().int(),
  stimuli_order: z.array(z.number().int()),
  stimuli_ids: z.array(z.custom<mongoose.Types.ObjectId>()),
});

// Extend the createUserSchema to include the optional _id field
export const experimentSessionsSchemaWithId = experimentSessionBaseSchema.merge(
  object({
    _id: z.string().optional(),
  }),
);

export type ExperimentSession = z.infer<typeof experimentSessionsSchemaWithId>;

export default {
  createExperimentSession: experimentSessionBaseSchema,
};
