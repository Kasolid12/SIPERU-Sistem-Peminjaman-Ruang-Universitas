import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { loginSchema, registerSchema } from "../validators/auth.validator";
import { asyncHandler } from "../utils/httpError";

export const authRouter = Router();

authRouter.post("/register", validate(registerSchema), asyncHandler(authController.register));
authRouter.post("/login", validate(loginSchema), asyncHandler(authController.login));
authRouter.get("/me", authMiddleware, asyncHandler(authController.me));
