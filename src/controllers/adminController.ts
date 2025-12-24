import { StudentModel } from "../models/students";   
import type { Request, Response } from "express";
import mongoose from "mongoose";
import  {AdminModel} from "../models/admin";
import bcrypt from "bcrypt";
import { handleLogout } from "./studentController";

declare module 'express-session' {
  interface SessionData {
    adminId?: string; // or number, choose the correct type for your app
  }
}


export const loadAdminPage = (req: Request, res: Response): void => {
    if (req.session.adminId) {
        return res.redirect("/admin");
    }
    res.render("admin/admin");
}

export const handleAdminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validate input
    if (!email || !password) {
      return res.render("admin/admin", {
        error: "Email and password are required"
      });
    }

    // 2️⃣ Find admin
    const admin = await AdminModel.findOne({ email });


    if (!admin) {
      return res.render("admin/admin", {
        error: "Invalid email or password"
      });
    }

    // 3️⃣ Compare password
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.render("admin/admin", {
        error: "Invalid email or password"
      });
    }

    // 4️⃣ Save session
    req.session.adminId = admin._id.toString();

    // 5️⃣ Redirect to dashboard
    res.redirect("/admin");

  } catch (error) {
    console.error("Admin login error:", error);
    res.render("admin/admin", {
      error: "Something went wrong"
    });
  }
};



export const loadAdminDashboard = async (req: Request, res: Response) => {
  try {
    if (!req.session.adminId) {
      return res.redirect("/admin/login");
    }

    const students = await StudentModel.find();

    let successMessage = null;
    let errorMessage = null;

    if (req.query.success === "created") {
      successMessage = "Student added successfully!";
    }

    if (req.query.success === "updated") {
      successMessage = "Student updated successfully!";
    }

    if (req.query.success === "deleted") {
      successMessage = "Student deleted successfully!";
    }

    if (req.query.error) {
      errorMessage = req.query.error;
    }

    res.render("admin/dashboard", {
      students,
      successMessage,
      errorMessage
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};






export const createStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, age, class: studentClass, email, password } = req.body;

    // 1️⃣ Basic required checks
    if (!name || !email || !password || !studentClass) {
      return res.redirect("/admin?error=All fields are required");
    }

    // 2️⃣ Duplicate name check
    const existingStudent = await StudentModel.findOne({ name });
    if (existingStudent) {
      return res.redirect("/admin?error=Student name already exists");
    }

    // 3️⃣ Class max = 12
    if (Number(studentClass) > 12) {
      return res.redirect("/admin?error=Class should not be greater than 12");
    }

    // 4️⃣ Password length check
    if (password.length < 8) {
      return res.redirect("/admin?error=Password must be at least 8 characters");
    }

    // 5️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = new StudentModel({
      name,
      age,
      class: studentClass,
      email,
      password: hashedPassword
    });

    await newStudent.save();

    // ✅ Success
    res.redirect("/admin?success=created");

  } catch (error) {
    console.error(error);
    res.redirect("/admin?error=Something went wrong");
  }
};




export const updateStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, name, email, age, class: studentClass } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
       res.status(400).send("Invalid student ID");
       return ;
    }

    await StudentModel.findByIdAndUpdate(id, {
      name,
      email,
      age,
      class: studentClass
    });

    // 🔁 Back to dashboard
   res.redirect("/admin?success=updated");


  } catch (error) {
    console.error("Update student error:", error);
    res.status(500).send("Server error");
  }
};
  



export const deleteStudent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.body;  
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: "Invalid student ID" });
            return;
        }
         await StudentModel.findByIdAndDelete(id);

    // 🔁 Redirect back to dashboard
   res.redirect("/admin?success=deleted");


    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

export const handleLogoutAdmin = (req: Request, res: Response): void => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying admin session:", err);
      return res.status(500).send("Server error");
    }
    res.clearCookie("student.sid");
    res.redirect("/admin/login");
  });
}; 