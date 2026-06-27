import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./src/routes/auth.routes.ts";
import chessRoutes from "./src/routes/chessMatch.routes.ts";

const app = express();

app.use(
  cors({
    origin:
      "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/game",
  chessRoutes
);

export default app;