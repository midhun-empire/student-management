import dotenv from "dotenv";
import express from "express";
import path from "path";
import session from "express-session";
import studentRoutes from "./routes/studentRoutes";
import adminRoutes from "./routes/adminRoutes";
import nocache from "nocache";
import connectDB from "./config/db";

dotenv.config();            
connectDB();               

const app = express();

app.use(nocache());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: "student.sid",            // 👈 give cookie a name
    secret: "student-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,                // MUST be false for localhost
      maxAge: 1000 * 60 * 60         // 1 hour
    }
  })
);


app.set("view engine", "hbs");
app.set("views", path.join(process.cwd(), "src/views"));

app.use(express.static(path.join(process.cwd(), "public")));

app.use("/", studentRoutes);
app.use("/admin", adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
