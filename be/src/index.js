import express from "express";
import activityRouter from "./routes/activity.route.js";
import attendanceRouter from "./routes/attendance.route.js";
import authRouter from "./routes/auth.route.js";
import memberRouter from "./routes/member.route.js";
import connectDb from "./services/db.js";
import envVariables from "./utils/ENV.js";

const app = express();
const PORT = envVariables.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (_req, res) => res.json({ status: "ok", app: "HIMAFOR Attendance API" }));

// Routes
app.use("/auth", authRouter);
app.use("/activities", activityRouter);
app.use("/attendance", attendanceRouter);
app.use("/members", memberRouter);

// 404 handler
app.use((_req, res) => res.status(404).json({ message: "Route tidak ditemukan" }));

// Start
await connectDb();
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
