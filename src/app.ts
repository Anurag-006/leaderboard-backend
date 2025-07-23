import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";

const app = express();

const allowedOrigins =
  process.env.ALLOWED_ORIGINS?.split(",").map((origin) => origin.trim()) || [];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// app.use(cors({
//   origin: process.env.ALLOWED_ORIGIN,
//   credentials: true,
// }));

app.use(express.json());
app.use("/api", userRoutes);

export default app;
