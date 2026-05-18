const express = require("express");
const cors = require("cors");
const videoRoutes = require("./routes/videoRoutes");
const { getFfmpegStatus, supportedPlatforms } = require("./services/ytdlpService");

const app = express();
const PORT = process.env.PORT || 5000;

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "*",
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
  console.error(error);

  if (res.headersSent) {
    return;
  }

  res.status(error.statusCode || 500).json({
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
