import { StudentModel } from "../models/students";
import { Request, Response } from "express";
import bcrypt from "bcrypt";

declare module 'express-session' {
  interface SessionData {
    studentId?: string; 
  }
}


export const loadLoginPage = (req: Request, res: Response): void => {
  if (req.session.studentId) {
    return res.redirect("/dashboard");
  }
  res.render("student/login",{error: null});
};



export const handleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    console.log(req.body);

    if (!email || !password) {
      return res.render("student/login", {
        error: "Email and password are required"
      });
    }

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


    req.session.studentId = student._id.toString();

  
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


export const handleLogout = (req: Request, res: Response): void => {
  req.session.destroy(() => {
    res.clearCookie("student.sid");
    res.redirect("/");
  });
};
