import { Request, Response, NextFunction } from "express";

export const studentAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.studentId) {
    return res.redirect("/");
  }
  next();
};
