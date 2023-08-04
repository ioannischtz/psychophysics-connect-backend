import { model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./user.valSchemas.js";

export const DOCUMENT_NAME = "User";
export const COLLECTION_NAME = "users";

const userSchema = new Schema<User>(
  {
    username: {
      type: Schema.Types.String,
      trim: true,
      maxlength: 100,
      required: true,
    },
    email: {
      type: Schema.Types.String,
      trim: true,
      unique: true,
      sparse: true, // allow null
      required: true,
      select: false,
    },
    password: {
      type: Schema.Types.String,
      required: true,
      select: false,
    },
    role: {
      type: Schema.Types.String,
      enum: ["subject", "experimenter"],
      required: true,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.index({ email: 1 }, { unique: true });

export const UserModel = model<User>(
  DOCUMENT_NAME,
  userSchema,
  COLLECTION_NAME,
);
