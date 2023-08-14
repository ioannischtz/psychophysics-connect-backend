import mongoose from "mongoose";
import { isValidAuthBearer } from "../../../policies/isValidReq.js";
import { z } from "zod";

const userBaseSchema = z.object({
  username: z.string().trim().max(100).optional(),
  email: z.string().email("not a valid email").trim().optional(),
  password: z
    .string()
    .min(6, "password too short - 6 characters minimum required")
    .optional(),
  role: z.enum(["subject", "experimenter"]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Extend the createUserSchema to include the optional _id field
export const userSchemaWithId = userBaseSchema.merge(
  z.object({
    _id: z.custom<mongoose.Types.ObjectId>(),
  }),
);

export interface User extends z.infer<typeof userSchemaWithId> {}

export default {
  createUserSchema: userBaseSchema,
  credentialsSchema: z.object({
    email: z
      .string({ required_error: "email is required" })
      .email("not a valid email")
      .trim()
      .nonempty(),
    password: z
      .string({ required_error: "password is required" })
      .min(6, "password too short - 6 characters minimum required"),
  }),
  auth: z.object({
    authorization: isValidAuthBearer(),
  }),
};
