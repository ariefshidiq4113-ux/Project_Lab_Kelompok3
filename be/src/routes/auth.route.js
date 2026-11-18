import { Router } from "express";
import { login, loginWithGoogle, changePassword, getMe } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const authRouter = Router();

// Public
authRouter.post("/login", login);
authRouter.post("/google", loginWithGoogle);

// Protected (perlu token)
authRouter.get("/me", requireAuth, getMe);
authRouter.post("/change-password", requireAuth, changePassword);

export default authRouter;
