const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env"), quiet: true });

const express = require("express");
const cors = require("cors");
const videoRoutes = require("./routes/videoRoutes");
const { getFfmpegStatus, supportedPlatforms } = require("./services/ytdlpService");

const app = express();
const PORT = process.env.PORT || 5000;
const defaultAllowedOrigins = [
  "http://127.0.0.1:5173",
  "http://localhost:5173",
  "https://universal-video-downloader-nine.vercel.app",
];
const configuredAllowedOrigins = [
  process.env.CLIENT_ORIGIN,
  process.env.CLIENT_ORIGINS,
]
  .filter(Boolean)
  .flatMap((origin) => origin.split(","))
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set([
  ...defaultAllowedOrigins,
  ...configuredAllowedOrigins,
]);

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has("*") || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    methods: ["GET", "POST", "OPTIONS"],
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.json({
    message: "Video Downloader API Running",
    supportedPlatforms,
  });
});

app.use("/api", videoRoutes);

// Backward-compatible aliases for the existing React UI.
app.use("/", videoRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  if (res.headersSent) {
    return;
  }

  res.status(statusCode).json({
    success: false,
    message: error.message || "Something went wrong while processing the request",
  });
});

app.listen(PORT, async () => {
  const hasFfmpeg = await getFfmpegStatus();
  console.log(`Video Downloader API running on port ${PORT}`);

  if (!hasFfmpeg) {
    console.warn("FFmpeg not found. Bundled ffmpeg-static should normally provide video remuxing support.");
  }
});
