import { Router } from "express";
const router = Router();
import {  createStudent, handleLogoutAdmin,updateStudent, deleteStudent ,loadAdminPage ,handleAdminLogin,loadAdminDashboard} from "../controllers/adminController";
import { adminAuth } from "../middlewares/adminAuth";


router.get("/login", loadAdminPage);
router.post("/login", handleAdminLogin);
router.get("/", adminAuth,loadAdminDashboard);
router.post("/create", adminAuth,createStudent);
router.post("/delete", adminAuth,deleteStudent);
router.get("/logout", adminAuth, handleLogoutAdmin);
router.post("/update", adminAuth,updateStudent);

export default router;