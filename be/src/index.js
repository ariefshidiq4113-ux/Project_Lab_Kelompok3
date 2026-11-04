import express from "express";
import authRouter from "./routes/auth.route.js";
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

// 404 handler
app.use((_req, res) => res.status(404).json({ message: "Route tidak ditemukan" }));

// Start
await connectDb();
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
