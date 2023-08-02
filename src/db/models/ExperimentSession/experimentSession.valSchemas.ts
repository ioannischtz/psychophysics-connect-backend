import mongoose from "mongoose";
import { z } from "zod";
import { responseSchemaWithId } from "../Response/response.valSchemas.js";
import { userSchemaWithId } from "../User/user.valSchemas.js";

const experimentSessionBaseSchema = z.object({
  subject: z.custom<mongoose.Types.ObjectId>((value) => {
    // Custom validation to ensure User has role=subject
    const user = userSchemaWithId.parse(value);
    if (user.role !== "subject") {
      throw new Error("Invalid subject: User must have role=subject");
    }
    return value;
  }),
  experiment: z.custom<mongoose.Types.ObjectId>(),
  isCompleted: z.boolean(),
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
