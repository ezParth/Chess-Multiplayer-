import mongoose, { Document, Schema } from "mongoose";

export interface IChessMatch extends Document {
  white: mongoose.Types.ObjectId;
  black: mongoose.Types.ObjectId;
//   winner?: mongoose.Types.ObjectId;
  result: "white" | "black" | "draw" | "pending" | "started";
  reason: "abandoned" | "resign" | "checkmate"
  finalFen: string;
  roomId: string

  createdAt: Date;
  updatedAt: Date;
}

const chessMatchSchema = new Schema<IChessMatch>(
    {
      white: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
  
      black: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
  
    //   winner: {
    //     type: Schema.Types.ObjectId,
    //     ref: "User",
    //     default: null,
    //   },
  
      result: {
        type: String,
        enum: ["white", "black", "draw", "pending", "started"],
        required: true,
      },

      reason: {
        type: String,
        enum: ["abandoned", "resign", "checkmate"],
      },
  
      finalFen: {
        type: String,
        default: "",
      },
      roomId: {
        type: String,
        required: true
      }
    },
    {
      timestamps: true,
    }
  );
  
  export const ChessMatch = mongoose.model<IChessMatch>(
    "ChessMatch",
    chessMatchSchema
  );