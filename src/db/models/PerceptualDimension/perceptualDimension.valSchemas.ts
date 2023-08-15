import { array, object, string, z } from "zod";
import mongoose from "mongoose";

const perceptualDimensionBaseSchema = object({
  title: string().nonempty().optional(),
  type: z.enum(["text", "img", "audio"]),
  description: string().optional(),
  mediaAssets: array(z.custom<mongoose.Types.ObjectId>()).optional(),
  experiments: array(z.custom<mongoose.Types.ObjectId>()).optional(),
});

export const perceptualDimensionSchemaWithId = perceptualDimensionBaseSchema
  .merge(
    object({
      _id: z.custom<mongoose.Types.ObjectId>(),
    }),
  );

export interface PerceptualDimension
  extends z.infer<typeof perceptualDimensionSchemaWithId> {}

const createperceptualDimension = perceptualDimensionBaseSchema.pick({
  title: true,
  type: true,
  description: true,
  mediaAsset: true,
  experiments: true,
});

export default { createperceptualDimension };
