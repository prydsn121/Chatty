import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5001;

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://chatty.onrender.com"],
    credentials: true,
  })
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// HEALTH CHECK — Respond FAST to Render's HEAD/GET /
app.head("/", (req, res) => res.status(200).end());  // ← NEW: Instant for HEAD
app.get("/", (req, res) => res.status(200).end());   // ← NEW: Instant for GET

// PRODUCTION: Serve frontend (AFTER health check)
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");

  app.use(express.static(frontendPath));

  // Catch-all (skip /api + root)
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/") || req.path === "/") return next();
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// Start server — Listen on ALL interfaces
server.listen(PORT, "0.0.0.0", () => {  // ← CRITICAL: "0.0.0.0" for Render
  console.log(`Server running on PORT: ${PORT}`);
  connectDB();
});