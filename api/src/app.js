import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { requestLogger } from "./middlewares/requestLogger.js";
import routes from "./routes/index.js";

export const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: env.ALLOWED_ORIGINS,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(requestLogger);

app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);
