import { isValidAuthBearer } from "../../policies/isValidReq.js";
import { object, string, z } from "zod";

const userBaseSchema = object({
  username: string({ required_error: "username is required" })
    .trim()
    .max(100)
    .nonempty(),
  email: string({ required_error: "email is required" })
    .email("not a valid email")
    .trim()
    .nonempty(),
  password: string({ required_error: "password is required" }).min(
    6,
    "password too short - 6 characters minimum required",
  ),
  role: z.enum(["subject", "experimenter"]),
});

// Extend the createUserSchema to include the optional _id field
export const userSchemaWithId = userBaseSchema.merge(
  object({
    _id: z.string().optional(),
  }),
);

export type User = z.infer<typeof userSchemaWithId>;

export default {
  createUserSchema: userBaseSchema,
  credentialsSchema: object({
    email: string({ required_error: "email is required" })
      .email("not a valid email")
      .trim()
      .nonempty(),
    password: string({ required_error: "password is required" }).min(
      6,
      "password too short - 6 characters minimum required",
    ),
  }),
  auth: object({
    authorization: isValidAuthBearer(),
  }),
};
