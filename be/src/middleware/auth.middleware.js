import jwt from "jsonwebtoken";
import envVariables from "../utils/ENV.js";

/**
 * Middleware: verifikasi JWT dari header Authorization: Bearer <token>
 * Menyisipkan req.memberId dan req.isAdmin jika valid.
 */
export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token tidak ditemukan." });
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, envVariables.JWT_SECRET);
    req.memberId = payload.sub;
    req.isAdmin = payload.isAdmin ?? false;
    next();
  } catch {
    return res.status(401).json({ message: "Token tidak valid atau sudah kedaluwarsa." });
  }
};
