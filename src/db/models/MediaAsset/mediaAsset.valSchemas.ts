import { mimeTypes } from "mimetypes.js";
import mongoose from "mongoose";
import { z } from "zod";

const mediaAssetBaseSchema = z.object({
  mimetype: z.enum(mimeTypes),
  filename: z.string().nonempty(),
  stimuli: z.array(z.custom<mongoose.Types.ObjectId>()),
  perceptualDimensions: z.array(z.custom<mongoose.Types.ObjectId>()),
});

export const mediaAssetSchemaWithId = mediaAssetBaseSchema.merge(
  z.object({
    _id: z.custom<mongoose.Types.ObjectId>().optional(),
  }),
);

export interface MediaAsset extends z.infer<typeof mediaAssetSchemaWithId> {}

export default { createMediaAsset: mediaAssetBaseSchema };
