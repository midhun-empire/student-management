import { StudentModel } from "../models/students";
import { Request, Response } from "express";
import bcrypt from "bcrypt";

declare module 'express-session' {
  interface SessionData {
    studentId?: string; // or number, choose the correct type for your app
  }
}

/* GET login page */
export const loadLoginPage = (req: Request, res: Response): void => {
  if (req.session.studentId) {
    return res.redirect("/dashboard");
  }
  res.render("student/login",{error: null});
};


/* POST login */
export const handleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    console.log(req.body);

    // 1️⃣ Check empty fields
    if (!email || !password) {
      return res.render("student/login", {
        error: "Email and password are required"
      });
    }

    // 2️⃣ Find student by email
    const student = await StudentModel.findOne({ email });

    if (!student) {
      return res.render("student/login", {
        error: "Invalid email or password"
      });
    }



    // 3️⃣ Compare password
    const isPasswordMatch = await bcrypt.compare(password, student.password);

    if (!isPasswordMatch) {
      return res.render("student/login", {
        error: "Invalid email or password"
      });
    }

    // 4️⃣ Save session
    req.session.studentId = student._id.toString();

    // 5️⃣ Redirect to dashboard
    res.redirect("/dashboard");

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).render("student/login", {
      error: "Something went wrong"
    });
  }
};

export const loadDashboard = async (req: Request, res: Response): Promise<void> => {
  if (!req.session.studentId) {
    return res.redirect("/");
  }

  const student = await StudentModel.findById(req.session.studentId);

  if (!student) {
    return res.redirect("/");
  }

  res.render("student/dashboard", { student });
};


/* Logout */
export const handleLogout = (req: Request, res: Response): void => {
  req.session.destroy(() => {
    res.clearCookie("student.sid");
    res.redirect("/");
  });
};
