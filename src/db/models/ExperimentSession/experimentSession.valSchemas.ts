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
    _id: z.string().optional(),
  }),
);

export type ExperimentSession = z.infer<typeof experimentSessionSchemaWithId>;

export default {
  createExperimentSession: experimentSessionBaseSchema,
};
