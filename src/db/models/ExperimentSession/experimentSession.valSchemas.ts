<<<<<<< HEAD
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
=======
import mongoose from "mongoose";
import { z } from "zod";
import { responseSchemaWithId } from "../Response/response.valSchemas.js";

const experimentSessionBaseSchema = z.object({
  subject: z.custom<mongoose.Types.ObjectId>(),
  experiment: z.custom<mongoose.Types.ObjectId>(),
  completed: z.boolean(),
  experiment_step: z.number().int(),
  stimuli_order: z.array(z.number().int()),
  responses: z.array(responseSchemaWithId),
});

export const experimentSessionSchemaWithId = experimentSessionBaseSchema.merge(
  z.object({
>>>>>>> main
    _id: z.string().optional(),
  }),
);

<<<<<<< HEAD
export type ExperimentSession = z.infer<typeof experimentSessionsSchemaWithId>;

export default {
  createExperimentSession: experimentSessionBaseSchema,
};
=======
export type ExperimentSession = z.infer<typeof experimentSessionSchemaWithId>;

export default { createExperimentSession: experimentSessionBaseSchema };
>>>>>>> main
