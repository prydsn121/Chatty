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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://chatty-1-c650.onrender.com"],
    credentials: true,
  })
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// PRODUCTION: Serve frontend
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");

  // Serve static files
  app.use(express.static(frontendPath));

  // HEALTH CHECK + ROOT
  app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });

  // CATCH-ALL for SPA (AFTER API routes)
  app.get("*", (req, res) => {
    // Skip API routes
    if (req.path.startsWith("/api")) return res.status(404).end();
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// Start server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  connectDB();
});