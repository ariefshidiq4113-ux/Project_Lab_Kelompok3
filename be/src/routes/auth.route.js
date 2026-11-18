import { Router } from "express";
import {
  login,
  loginWithGoogle,
  loginWithGoogleToken,
  loginWithGoogleEmail,
  startGoogleOAuth,
  handleGoogleOAuthCallback,
  changePassword,
  getMe,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const authRouter = Router();

// Public
authRouter.post("/login", login);
authRouter.post("/google", loginWithGoogle);
authRouter.post("/google/token", loginWithGoogleToken);
authRouter.post("/google/email", loginWithGoogleEmail);

// Google OAuth Web / Redirect Flow (Support Expo Go)
authRouter.get("/google/start", startGoogleOAuth);
authRouter.get("/google/callback", handleGoogleOAuthCallback);

// Protected (perlu token)
authRouter.get("/me", requireAuth, getMe);
authRouter.post("/change-password", requireAuth, changePassword);

export default authRouter;
