import { Schema, model } from "mongoose";

const adminSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

export const AdminModel = model("Admin", adminSchema);
