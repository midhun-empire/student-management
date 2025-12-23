import {loadLoginPage,handleLogin,handleLogout,loadDashboard} from "../controllers/studentController";
import { Router } from "express";
import { studentAuth } from "../middlewares/studentAuth";
const router = Router();

router.get("/",loadLoginPage);
router.get("/dashboard", studentAuth,loadDashboard);
router.post("/login",handleLogin);
router.get("/logout",studentAuth,handleLogout);



export default router;