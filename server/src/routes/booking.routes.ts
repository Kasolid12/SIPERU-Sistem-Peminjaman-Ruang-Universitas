import { Router } from "express";
import { bookingController } from "../controllers/booking.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  bookingCreateSchema,
  bookingListQuerySchema,
  bookingParamsSchema,
  bookingStatusSchema,
} from "../validators/booking.validator";
import { asyncHandler } from "../utils/httpError";

export const bookingRouter = Router();

bookingRouter.use(authMiddleware);

// Admin & dosen bisa melihat & membuat pengajuan.
bookingRouter.get("/", validate(bookingListQuerySchema, "query"), asyncHandler(bookingController.list));
bookingRouter.get("/:id", validate(bookingParamsSchema, "params"), asyncHandler(bookingController.getById));
bookingRouter.post("/", validate(bookingCreateSchema), asyncHandler(bookingController.create));
bookingRouter.delete("/:id", validate(bookingParamsSchema, "params"), asyncHandler(bookingController.cancel));

// Approval/Reject hanya admin.
bookingRouter.patch(
  "/:id/status",
  roleMiddleware("ADMIN"),
  validate(bookingParamsSchema, "params"),
  validate(bookingStatusSchema),
  asyncHandler(bookingController.setStatus),
);
