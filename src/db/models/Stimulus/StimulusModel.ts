import { model, Schema } from "mongoose";
import { Stimulus } from "./stimulus.valSchemas.js";

export const DOCUMENT_NAME = "User";
export const COLLECTION_NAME = "users";

const stimulusSchema = new Schema<Stimulus>(
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
      required: true,
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
    },
  },
  {
    timestamps: true,
    versionKey: true,
  },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

export const UserModel = model<User>(
  DOCUMENT_NAME,
  userSchema,
  COLLECTION_NAME,
);
