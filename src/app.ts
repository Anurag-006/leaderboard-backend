import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173", // Local Dev
  "https://leaderboard-front.netlify.app", // Frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
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
