import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";
import { dashboardService } from "../services/dashboard.service";
import { asyncHandler } from "../utils/httpError";

export const dashboardRouter = Router();

dashboardRouter.get(
  "/summary",
  authMiddleware,
  roleMiddleware("ADMIN"),
  asyncHandler(async (_req, res) => {
    const summary = await dashboardService.summary();
    res.json(summary);
  }),
);
