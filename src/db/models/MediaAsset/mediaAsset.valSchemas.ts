import mongoose from "mongoose";
import { z } from "zod";

const mediaAssetBaseSchema = z.object({
  mimetype: z.string().nonempty(),
  filename: z.string().nonempty(),
  stimuli: z.array(z.custom<mongoose.Types.ObjectId>()),
  perceptualDimensions: z.array(z.custom<mongoose.Types.ObjectId>()),
});

export const mediaAssetSchemaWithId = mediaAssetBaseSchema.merge(
  z.object({
    _id: z.string().optional(),
  }),
);

export type MediaAsset = z.infer<typeof mediaAssetSchemaWithId>;

export default { createMediaAsset: mediaAssetBaseSchema };
