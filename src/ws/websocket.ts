import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : ["https://leaderboard-front.netlify.app"]; // fallback if .env missing

const clients = new Set<WebSocket>();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
    const origin = req.headers.origin;

    if (!origin || !allowedOrigins.includes(origin)) {
      console.warn("❌ Blocked WebSocket connection from:", origin);
      ws.close(1008, "Origin not allowed");
      return;
    }

    console.log("🔗 WebSocket connected:", origin);
    clients.add(ws);

    // Send latest leaderboard on connect
    broadcastLeaderboardTo(ws);

    ws.on("close", () => {
      clients.delete(ws);
      console.log("🔌 Client disconnected");
    });

    ws.on("error", (err) => {
      clients.delete(ws);
      console.error("⚠️ WebSocket error:", err.message);
    });

    // Optional: handle incoming messages
    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        console.log("🔔 Received message from client:", msg);
        // Handle types here if needed
        if (msg.type === "claim") {
          const claimedMsg = {
            type: "claimed-message",
            data: `✅ ${msg.name} claimed ${msg.points} points`,
          };

          console.log("📤 Broadcasting claimed message:", claimedMsg);

          for (const client of clients) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(claimedMsg));
            }
          }
        }
      } catch (e) {
        console.error("⚠️ Invalid message format:", data.toString());
      }
    });
  });
}

export async function broadcastLeaderboardToAll() {
  const data = await getLeaderboardData();
  const json = JSON.stringify({ type: "leaderboard", payload: data });

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  }
}

async function broadcastLeaderboardTo(ws: WebSocket) {
  const data = await getLeaderboardData();
  const json = JSON.stringify({ type: "leaderboard", payload: data });

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(json);
  }
}

async function getLeaderboardData() {
  const { User } = await import("../models/user.model.js");
  const users = await User.find().sort({ totalPoints: -1 }).lean();

  return users.map((u, i) => ({
    _id: u._id.toString(),
    name: u.name,
    points: u.totalPoints,
    rank: i + 1,
  }));
}
