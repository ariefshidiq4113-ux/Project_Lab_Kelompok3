import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import Member from "../models/member.model.js";
import envVariables from "../utils/ENV.js";

const JWT_SECRET = envVariables.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";
const googleClient = new OAuth2Client(envVariables.GOOGLE_CLIENT_ID);

/**
 * POST /auth/login
 * Body: { email: string, password: string }
 *
 * Response 200:
 * {
 *   token: string,
 *   member: { id, nama, nim, email, jabatan, departemen, isAdmin, mustChangePassword }
 * }
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({ message: "Email dan password wajib diisi." });
    }

    // Cari anggota berdasarkan email
    const member = await Member.findOne({
      email: email.trim().toLowerCase(),
      aktif: true,
    });

    if (!member) {
      return res.status(401).json({ message: "Email atau password salah." });
    }

    // Verifikasi password
    const passwordMatch = await bcrypt.compare(password, member.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Email atau password salah." });
    }

    // Buat JWT
    const payload = {
      sub: member._id.toString(),
      nim: member.nim,
      isAdmin: member.isAdmin,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(200).json({
      token,
      member: {
        id: member._id,
        nama: member.nama,
        nim: member.nim,
        email: member.email,
        jabatan: member.jabatan,
        departemen: member.departemen,
        kodeDepartemen: member.kodeDepartemen,
        isAdmin: member.isAdmin,   
        mustChangePassword: member.mustChangePassword,
      },
    });
  } catch (err) {
    console.error("[login]", err);
    return res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * POST /auth/change-password
 * Header: Authorization: Bearer <token>
 * Body: { currentPassword: string, newPassword: string }
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Password lama dan baru wajib diisi." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password baru minimal 6 karakter." });
    }

    // Ambil member dari token (di-set oleh middleware auth)
    const member = await Member.findById(req.memberId);
    if (!member) {
      return res.status(404).json({ message: "Anggota tidak ditemukan." });
    }

    const match = await bcrypt.compare(currentPassword, member.passwordHash);
    if (!match) {
      return res.status(401).json({ message: "Password lama salah." });
    }

    member.passwordHash = await bcrypt.hash(newPassword, 10);
    member.mustChangePassword = false;
    await member.save();

    return res.status(200).json({ message: "Password berhasil diubah." });
  } catch (err) {
    console.error("[changePassword]", err);
    return res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * GET /auth/me
 * Header: Authorization: Bearer <token>
 */
export const getMe = async (req, res) => {
  try {
    const member = await Member.findById(req.memberId).select("-passwordHash");
    if (!member) {
      return res.status(404).json({ message: "Anggota tidak ditemukan." });
    }
    return res.status(200).json({ member });
  } catch (err) {
    console.error("[getMe]", err);
    return res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * POST /auth/google/email
 * Body: { email: string, googleId: string }
 * Dipakai saat accessToken tersedia tapi bukan idToken.
 * Email sudah diverifikasi Google di sisi frontend via userinfo endpoint.
 */
export const loginWithGoogleEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email wajib diisi." });
    }

    const member = await Member.findOne({
      email: email.trim().toLowerCase(),
      aktif: true,
    });

    if (!member) {
      return res.status(403).json({
        message: "Email ini tidak terdaftar sebagai anggota HIMAFOR. Hubungi admin.",
      });
    }

    const payload = {
      sub: member._id.toString(),
      nim: member.nim,
      isAdmin: member.isAdmin,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(200).json({
      token,
      member: {
        id: member._id,
        nama: member.nama,
        nim: member.nim,
        email: member.email,
        jabatan: member.jabatan,
        departemen: member.departemen,
        kodeDepartemen: member.kodeDepartemen,
        isAdmin: member.isAdmin,
        mustChangePassword: member.mustChangePassword,
      },
    });
  } catch (err) {
    console.error("[loginWithGoogleEmail]", err);
    return res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};
export const loginWithGoogleToken = async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ message: "accessToken wajib diisi." });
    }

    // Backend fetch userinfo dari Google
    const googleRes = await fetch("https://www.googleapis.com/userinfo/v2/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!googleRes.ok) {
      return res.status(401).json({ message: "accessToken Google tidak valid." });
    }

    const userInfo = await googleRes.json();
    const email = userInfo.email?.toLowerCase();

    if (!email) {
      return res.status(401).json({ message: "Email tidak ditemukan di akun Google." });
    }

    const member = await Member.findOne({ email, aktif: true });

    if (!member) {
      return res.status(403).json({
        message: "Email ini tidak terdaftar sebagai anggota HIMAFOR. Hubungi admin.",
      });
    }

    const payload = {
      sub: member._id.toString(),
      nim: member.nim,
      isAdmin: member.isAdmin,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(200).json({
      token,
      member: {
        id: member._id,
        nama: member.nama,
        nim: member.nim,
        email: member.email,
        jabatan: member.jabatan,
        departemen: member.departemen,
        kodeDepartemen: member.kodeDepartemen,
        isAdmin: member.isAdmin,
        mustChangePassword: member.mustChangePassword,
      },
    });
  } catch (err) {
    console.error("[loginWithGoogleToken]", err);
    return res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

export const loginWithGoogle = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "idToken wajib diisi." });
    }

    if (!envVariables.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: "Google OAuth belum dikonfigurasi di server." });
    }

    // 1. Verifikasi idToken ke Google
    let googlePayload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: envVariables.GOOGLE_CLIENT_ID,
      });
      googlePayload = ticket.getPayload();
    } catch {
      return res.status(401).json({ message: "Token Google tidak valid atau sudah kedaluwarsa." });
    }

    const googleEmail = googlePayload?.email?.toLowerCase();
    const emailVerified = googlePayload?.email_verified;

    if (!googleEmail || !emailVerified) {
      return res.status(401).json({ message: "Email Google belum terverifikasi." });
    }

    // 2. Cari member berdasarkan email
    const member = await Member.findOne({ email: googleEmail, aktif: true });

    if (!member) {
      return res.status(403).json({
        message: "Email ini tidak terdaftar sebagai anggota HIMAFOR. Hubungi admin.",
      });
    }

    // 3. Buat JWT app
    const payload = {
      sub: member._id.toString(),
      nim: member.nim,
      isAdmin: member.isAdmin,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(200).json({
      token,
      member: {
        id: member._id,
        nama: member.nama,
        nim: member.nim,
        email: member.email,
        jabatan: member.jabatan,
        departemen: member.departemen,
        kodeDepartemen: member.kodeDepartemen,
        isAdmin: member.isAdmin,
        mustChangePassword: member.mustChangePassword,
      },
    });
  } catch (err) {
    console.error("[loginWithGoogle]", err);
    return res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * GET /auth/google/start
 * Membuka alur Google OAuth web redirect.
 * Query: ?redirect_uri=... (URI aplikasi, misal exp://... atau kelompok3://)
 */
export const startGoogleOAuth = (req, res) => {
  try {
    const { redirect_uri } = req.query;

    if (!envVariables.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: "GOOGLE_CLIENT_ID belum diset di server (.env)." });
    }

    const host = req.get("host");
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const callbackUrl = `${protocol}://${host}/auth/google/callback`;

    const stateData = {
      appRedirectUri: redirect_uri || "kelompok3://",
      callbackUrl,
    };
    const state = Buffer.from(JSON.stringify(stateData)).toString("base64url");

    const googleAuthUrl =
      "https://accounts.google.com/o/oauth2/v2/auth?" +
      new URLSearchParams({
        client_id: envVariables.GOOGLE_CLIENT_ID,
        redirect_uri: callbackUrl,
        response_type: "code",
        scope: "openid email profile",
        access_type: "offline",
        state,
        prompt: "select_account",
      }).toString();

    return res.redirect(googleAuthUrl);
  } catch (err) {
    console.error("[startGoogleOAuth]", err);
    return res.status(500).json({ message: "Gagal memulai login Google." });
  }
};

/**
 * GET /auth/google/callback
 * Callback setelah user login di Google consent screen.
 */
export const handleGoogleOAuthCallback = async (req, res) => {
  const { code, state, error: googleError } = req.query;

  let stateData = { appRedirectUri: "kelompok3://" };
  try {
    if (state) {
      stateData = JSON.parse(Buffer.from(state, "base64url").toString("utf-8"));
    }
  } catch (err) {
    console.error("[OAuth] Gagal parse state:", err);
  }

  const appRedirectUri = stateData.appRedirectUri || "kelompok3://";
  const callbackUrl = stateData.callbackUrl;

  const returnToApp = (params) => {
    const separator = appRedirectUri.includes("?") ? "&" : "?";
    const query = new URLSearchParams(params).toString();
    const targetUrl = `${appRedirectUri}${separator}${query}`;

    return res.send(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>HIMAFOR Attendance</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f4f7fc; }
    .card { background: white; padding: 32px; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); text-align: center; max-width: 90%; width: 360px; }
    .btn { display: inline-block; margin-top: 20px; padding: 14px 24px; background: #101477; color: white; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 15px; }
    h3 { color: #101477; margin-bottom: 8px; }
    p { color: #6b7280; font-size: 14px; margin: 0; }
  </style>
  <script>
    window.location.href = ${JSON.stringify(targetUrl)};
  </script>
</head>
<body>
  <div class="card">
    <h3>Sedang Kembali ke Aplikasi...</h3>
    <p>Jika aplikasi tidak terbuka otomatis, tekan tombol di bawah:</p>
    <a class="btn" href="${targetUrl}">Buka Aplikasi HIMAFOR</a>
  </div>
</body>
</html>
    `);
  };

  if (googleError || !code) {
    return returnToApp({ error: googleError || "Login Google dibatalkan." });
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: envVariables.GOOGLE_CLIENT_ID,
        client_secret: envVariables.GOOGLE_CLIENT_SECRET,
        redirect_uri: callbackUrl,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("[OAuth] Gagal menukar token:", tokenData);
      return returnToApp({
        error: tokenData.error_description || "Gagal verifikasi ke Google. Pastikan Client Secret di .env sudah benar.",
      });
    }

    const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userInfo = await userinfoRes.json();
    const email = userInfo?.email?.toLowerCase();

    if (!email) {
      return returnToApp({ error: "Email Google tidak ditemukan." });
    }

    const member = await Member.findOne({ email, aktif: true });
    if (!member) {
      return returnToApp({
        error: "Email (" + email + ") belum terdaftar sebagai anggota HIMAFOR. Hubungi admin.",
      });
    }

    const payload = {
      sub: member._id.toString(),
      nim: member.nim,
      isAdmin: member.isAdmin,
    };
    const appToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    const memberPayload = {
      id: member._id.toString(),
      nama: member.nama,
      nim: member.nim,
      email: member.email,
      jabatan: member.jabatan,
      departemen: member.departemen,
      kodeDepartemen: member.kodeDepartemen,
      isAdmin: member.isAdmin,
      mustChangePassword: member.mustChangePassword,
    };

    return returnToApp({
      token: appToken,
      member: JSON.stringify(memberPayload),
    });
  } catch (err) {
    console.error("[handleGoogleOAuthCallback]", err);
    return returnToApp({ error: "Terjadi kesalahan server saat login Google." });
  }
};
