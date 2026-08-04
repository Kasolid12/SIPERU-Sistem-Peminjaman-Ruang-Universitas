import bcrypt from "bcrypt";
import { userRepository } from "../repositories/user.repository";
import { signToken } from "../utils/jwt";
import { AppError } from "../utils/httpError";
import type { LoginInput, RegisterInput } from "../validators/auth.validator";

const SALT_ROUNDS = 10;

function toPublicUser(user: { id: number; nama: string; email: string; role: string }) {
  return { id: user.id, nama: user.nama, email: user.email, role: user.role };
}

export const authService = {
  /** Registrasi user baru — role default DOSEN. */
  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError(409, "Email sudah terdaftar.");
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await userRepository.create({
      nama: input.nama,
      email: input.email,
      password: passwordHash,
      role: "DOSEN",
    });

    const token = signToken({ id: user.id, role: user.role });
    return { token, user: toPublicUser(user) };
  },

  /** Login — verifikasi kredensial, terbitkan JWT. */
  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError(401, "Email atau password salah.");
    }

    const passwordMatch = await bcrypt.compare(input.password, user.password);
    if (!passwordMatch) {
      throw new AppError(401, "Email atau password salah.");
    }

    const token = signToken({ id: user.id, role: user.role });
    return { token, user: toPublicUser(user) };
  },
};
