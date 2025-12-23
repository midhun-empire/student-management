import { Schema, model } from "mongoose";

const studentSchema = new Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    class:{type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

export const StudentModel = model("Student", studentSchema);
