import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Member from "../models/member.model.js";
import envVariables from "../utils/ENV.js";

const JWT_SECRET = envVariables.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";

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
