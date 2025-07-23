import { Schema, model, Document } from "mongoose";

export interface IHistory extends Document {
  userId: string;
  userName: string;
  pointsClaimed: number;
  claimedAt: Date;
}

const historySchema = new Schema<IHistory>({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  pointsClaimed: { type: Number, required: true },
  claimedAt: { type: Date, default: Date.now },
});

export const PointHistory = model<IHistory>("PointHistory", historySchema);
