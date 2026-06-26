import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  password: string;

  won: number;
  loss: number;
  draws: number;

  matches: mongoose.Types.ObjectId[];
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    won: {
      type: Number,
      default: 0,
    },

    loss: {
      type: Number,
      default: 0,
    },

    draws: {
      type: Number,
      default: 0,
    },

    matches: [
      {
        type: Schema.Types.ObjectId,
        ref: "ChessMatch",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>("User", userSchema);