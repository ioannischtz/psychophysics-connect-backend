import mongoose from "mongoose";
import { object, z } from "zod";

const responseBaseSchema = object({
  stimulus: z.custom<mongoose.Types.ObjectId>(),
  perceptualDimension: z.custom<mongoose.Types.ObjectId>(),
  trial_N: z.number().min(0),
  responseMode: z.enum(["slider", "arrows", "grid"]),
  playCount: z.number().min(0),
  timeElapsed: z.number(),
  response: z.number(),
});

export const responseSchemaWithId = responseBaseSchema.merge(
  object({
    _id: z.string().optional(),
  }),
);

export type Response = z.infer<typeof responseSchemaWithId>;

export default { createResponse: responseBaseSchema };
