import { Request, Response } from "express";
import { User } from "../models/user.model.js";
import { PointHistory } from "../models/history.model.js";
import { broadcastLeaderboardToAll } from "../ws/websocket.js";

export const getAllUsers = async (_req: Request, res: Response) => {
  const users = await User.find();
  res.json(users);
};

export const addUser = async (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Name is required" });
  }

  const newUser = new User({ name: name.trim() });
  await newUser.save();

  // ✅ Broadcast the new leaderboard
  await broadcastLeaderboardToAll();

  res.status(201).json(newUser);
};

export const claimPoints = async (req: Request, res: Response) => {
  const { userId } = req.params;
  // generate a random number between 1 and 10.
  const points = Math.floor(Math.random() * 10) + 1;

  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { totalPoints: points } },
    { new: true },
  );

  if (!user) return res.status(404).json({ error: "User not found" });

  await PointHistory.create({
    userId: user._id,
    userName: user.name,
    pointsClaimed: points,
    claimedAt: new Date(),
  });

  // Broadcast new leaderboard to all clients
  await broadcastLeaderboardToAll();

  res.json({ user, pointsClaimed: points });
};

export const getLeaderboard = async (_req: Request, res: Response) => {
  const leaderboard = await User.find().sort({ totalPoints: -1 });
  res.json(leaderboard);
};

export const getUserHistory = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const history = await PointHistory.find({ userId }).sort({ claimedAt: -1 });
  res.json(history);
};

export const getHistory = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;

  const limit = 10;

  try {
    const total = await PointHistory.countDocuments();
    const history = await PointHistory.find()
      .sort({ claimedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      history,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
};
