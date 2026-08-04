import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { authRouter } from "./routes/auth.routes";
import { roomRouter } from "./routes/room.routes";
import { bookingRouter } from "./routes/booking.routes";
import { dashboardRouter } from "./routes/dashboard.routes";
import { notFoundMiddleware } from "./middlewares/notFound.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.clientOrigin, credentials: true }));
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "siperu-api", time: new Date().toISOString() });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/rooms", roomRouter);
  app.use("/api/bookings", bookingRouter);
  app.use("/api/dashboard", dashboardRouter);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
