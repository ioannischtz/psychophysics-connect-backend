import { model, Schema } from "mongoose";
import { Stimulus } from "./stimulus.valSchemas.js";

<<<<<<< HEAD
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
=======
export const DOCUMENT_NAME = "Stimulus";
export const COLLECTION_NAME = "stimuli";

const stimulusSchema = new Schema<Stimulus>(
  {
    title: { type: Schema.Types.String, required: true },
    type: {
      type: Schema.Types.String,
      enum: ["text", "img", "audio"],
      required: true,
    },
    description: { type: Schema.Types.String, required: false },
    mediaAsset: {
      type: Schema.Types.ObjectId,
      ref: "MediaAsset",
      required: true,
    },
    experiments: [{ type: Schema.Types.ObjectId, ref: "Experiment" }],
>>>>>>> main
  },
  {
    timestamps: true,
    versionKey: true,
  },
);

<<<<<<< HEAD
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

export const UserModel = model<User>(
  DOCUMENT_NAME,
  userSchema,
=======
export const StimulusModel = model<Stimulus>(
  DOCUMENT_NAME,
  stimulusSchema,
>>>>>>> main
  COLLECTION_NAME,
);
