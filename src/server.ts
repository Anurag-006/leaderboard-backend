import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import app from "./app.js";
import { setupWebSocket } from "./ws/websocket.js";
import http from "http";

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "";

console.log("Mongo Uri is: ", process.env.MONGO_URI);

const server = http.createServer(app);
console.log("Before websocket");

setupWebSocket(server);

console.log("After websocket");

mongoose.connect(MONGO_URI).then(() => {
  console.log("Connected to MongoDB");
  server.listen(PORT, () => {
    console.log(`HTTP & WS server running on port ${PORT}`);
  });
});
