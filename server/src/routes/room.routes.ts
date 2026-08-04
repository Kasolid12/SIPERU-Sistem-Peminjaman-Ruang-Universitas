import { Router } from "express";
import { roomController } from "../controllers/room.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  roomCreateSchema,
  roomListQuerySchema,
  roomParamsSchema,
  roomUpdateSchema,
} from "../validators/room.validator";
import { asyncHandler } from "../utils/httpError";

export const roomRouter = Router();

roomRouter.use(authMiddleware);

// Dibaca oleh admin & dosen.
roomRouter.get("/", validate(roomListQuerySchema, "query"), asyncHandler(roomController.list));
roomRouter.get("/:id", validate(roomParamsSchema, "params"), asyncHandler(roomController.getById));

// Hanya admin yang boleh mengubah data ruang.
roomRouter.post(
  "/",
  roleMiddleware("ADMIN"),
  validate(roomCreateSchema),
  asyncHandler(roomController.create),
);
roomRouter.post(
  "/sync",
  roleMiddleware("ADMIN"),
  asyncHandler(roomController.sync),
);
roomRouter.put(
  "/:id",
  roleMiddleware("ADMIN"),
  validate(roomParamsSchema, "params"),
  validate(roomUpdateSchema),
  asyncHandler(roomController.update),
);
roomRouter.delete(
  "/:id",
  roleMiddleware("ADMIN"),
  validate(roomParamsSchema, "params"),
  asyncHandler(roomController.remove),
);
