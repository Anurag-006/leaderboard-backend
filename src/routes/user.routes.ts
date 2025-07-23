import { Router } from "express";
import {
  getAllUsers,
  addUser,
  claimPoints,
  getLeaderboard,
  getUserHistory,
  getHistory,
} from "../controllers/user.controller.js";

const router = Router();

router.get("/users", getAllUsers);
router.post("/users", addUser);
router.post("/claim/:userId", claimPoints);
router.get("/leaderboard", getLeaderboard);
router.get("/history", getHistory);
router.get("/history/:userId", getUserHistory);

export default router;
