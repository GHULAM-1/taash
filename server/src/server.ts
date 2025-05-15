import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import path from "path";

import authRoutes from "@/routes/auth";
import  verifyRoutes  from "@/routes/verify";
import authMiddleware from "@/middleware/auth";
import { port, frontendUrl, mongoUri, env } from "@/config";

const app = express();

// Serve static assets from the public folder (outside of src)
app.use(express.static(path.join(__dirname, "..", "public")));

// Security & parsing
app.use(helmet());
app.use(
  cors({
    origin: env === "development" ? true : frontendUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// MongoDB connection (no extra options needed in Mongoose v6+)
mongoose
  .connect(mongoUri)
  .then(() => console.log("MongoDB connected"))
  .catch((err: Error) => console.error("MongoDB error:", err));

// API routes
app.use("/api/auth", authRoutes);
app.use("/", verifyRoutes);

// Protected endpoint example
app.get("/api/protected", authMiddleware, (req, res) => {
  // TS knows `req.user.email` exists and is a string
  res.json({ message: `Hello, ${req?.user.email}` });
});

app.listen(port, () => {
  console.log(`Server running in ${env} mode on port ${port}`);
});
