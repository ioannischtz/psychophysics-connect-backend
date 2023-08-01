import { array, object, string, z } from "zod";
import mongoose from "mongoose";

const perceptualDimensionBaseSchema = object({
  title: string().nonempty(),
  type: z.enum(["text", "img", "audio"]),
  description: string().optional(),
  mediaAssets: array(z.custom<mongoose.Types.ObjectId>()),
  experiments: array(z.custom<mongoose.Types.ObjectId>()),
});

export const perceptualDimensionSchemaWithId = perceptualDimensionBaseSchema
  .merge(
    object({
      _id: string().optional(),
    }),
  );

export type PerceptualDimension = z.infer<
  typeof perceptualDimensionSchemaWithId
>;

const createperceptualDimension = perceptualDimensionBaseSchema.pick({
  title: true,
  type: true,
  description: true,
  mediaAsset: true,
});

export default { createperceptualDimension };
