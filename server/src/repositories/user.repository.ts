import { prisma } from "../config/prisma";
import type { Role } from "../../generated/prisma/enums";
import type { RegisterInput } from "../validators/auth.validator";

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id: number) {
    return prisma.user.findUnique({ where: { id } });
  },

  create(data: RegisterInput & { role: Role; password: string }) {
    return prisma.user.create({ data });
  },

  count() {
    return prisma.user.count();
  },
};
