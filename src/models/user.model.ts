import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  totalPoints: number;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  totalPoints: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export const User = model<IUser>("User", userSchema);
