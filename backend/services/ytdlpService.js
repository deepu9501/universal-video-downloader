const { spawn } = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { Readable } = require("stream");
const ffmpegStaticPath = require("ffmpeg-static");
const ytdlp = require("yt-dlp-exec");
const { createContentDisposition, sanitizeFileName } = require("../utils/file");
const {
  detectPlatform,
  isSupportedPlatform,
  isValidHttpUrl,
  normalizeUrl,
} = require("../utils/platformDetector");

const defaultUserAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";
const ffmpegPath = process.env.FFMPEG_PATH || ffmpegStaticPath;
const tempDir = path.join(__dirname, "..", "temp");

const baseYtdlpFlags = {
  noWarnings: true,
  noPlaylist: true,
  noCheckCertificates: true,
  userAgent: process.env.YTDLP_USER_AGENT || defaultUserAgent,
};

const tiktokCache = new Map();
const tiktokCacheTtlMs = 5 * 60 * 1000;
const supportedPlatforms = ["YouTube", "YouTube Shorts", "Instagram Reels", "Instagram", "Facebook", "TikTok", "Twitter/X"];

const getYtdlpFlags = () => {
  const flags = { ...baseYtdlpFlags };

  if (ffmpegPath) {
    flags.ffmpegLocation = ffmpegPath;
  }

  if (process.env.YTDLP_COOKIES_PATH) {
    flags.cookies = process.env.YTDLP_COOKIES_PATH;
  }

  if (process.env.YTDLP_PROXY) {
    flags.proxy = process.env.YTDLP_PROXY;
  }

  if (process.env.YTDLP_REFERER) {
    flags.referer = process.env.YTDLP_REFERER;
  }

  return flags;
};

const isTikTokUrl = (url) => /(^|\.)tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com/i.test(url);

const ensureUrl = (url) => {
  const normalizedUrl = normalizeUrl(url);

  if (!isValidHttpUrl(normalizedUrl)) {
    const error = new Error("Invalid URL. Please paste a valid video link.");
    error.statusCode = 400;
    throw error;
  }

  if (!isSupportedPlatform(normalizedUrl)) {
    const error = new Error("Unsupported platform. Only YouTube, Instagram, Facebook, TikTok, and Twitter/X links are allowed.");
    error.statusCode = 400;
    throw error;
  }

  return normalizedUrl;
};

const normalizeYtdlpError = (error) => {
  const message = error.stderr || error.message || "Unable to process this URL";
  const cleanMessage = message.trim().split("\n").pop() || "Unable to process this URL";

  if (/unsupported url|no suitable extractor/i.test(message)) {
    error.statusCode = 400;
    error.message = "Unsupported link. Only YouTube, Instagram, Facebook, TikTok, and Twitter/X links are allowed.";
    return error;
  }

  if (/bot|login|sign in|cookies/i.test(message)) {
    error.statusCode = 422;
    error.message =
      "This platform is asking for login verification. Configure YTDLP_COOKIES_PATH with exported browser cookies or try another public link.";
    return error;
  }

  if (/unavailable|private|not available|copyright|blocked|rate-limit|rate limit/i.test(message)) {
    error.statusCode = 422;
    error.message =
      "This video is unavailable or cannot be accessed publicly from the server. Try another public link.";
    return error;
  }

  if (/ffmpeg|merg/i.test(message)) {
    error.statusCode = 503;
    error.message = "FFmpeg is required for this format. Install FFmpeg and add it to PATH.";
    return error;
  }

  error.statusCode = error.statusCode || 502;
  error.message = cleanMessage;
  return error;
};

const getFfmpegStatus = () =>
  new Promise((resolve) => {
    const process = spawn(ffmpegPath || "ffmpeg", ["-version"], { windowsHide: true });

    process.on("error", () => resolve(false));
    process.on("close", (code) => resolve(code === 0));
  });

const mapFormat = (format) => ({
  formatId: format.format_id,
  quality:
    format.format_note ||
    format.resolution ||
    (format.height ? `${format.height}p` : "Best"),
  ext: format.ext,
  resolution: format.resolution,
  fps: format.fps,
  filesize: format.filesize || format.filesize_approx,
  hasAudio: format.acodec && format.acodec !== "none",
  hasVideo: format.vcodec && format.vcodec !== "none",
});

const getVideoInfo = async (url) => {
  const normalizedUrl = ensureUrl(url);

  let info;

  try {
    info = await ytdlp(normalizedUrl, {
      ...getYtdlpFlags(),
      dumpSingleJson: true,
      skipDownload: true,
    });
  } catch (error) {
    if (isTikTokUrl(normalizedUrl) && process.env.TIKTOK_FALLBACK_DISABLED !== "true") {
      return getTikTokFallbackInfo(normalizedUrl);
    }

    throw normalizeYtdlpError(error);
  }

  const formats = Array.isArray(info.formats)
    ? info.formats
        .filter((format) => format.format_id && format.vcodec !== "none")
        .map(mapFormat)
        .filter((format, index, list) => {
          const key = `${format.quality}-${format.formatId}`;
          return list.findIndex((item) => `${item.quality}-${item.formatId}` === key) === index;
        })
        .slice(0, 30)
    : [];

  return {
    success: true,
    title: info.title || "Untitled video",
    thumbnail: info.thumbnail || null,
    duration: info.duration || null,
    platform: detectPlatform(normalizedUrl, info.extractor_key || info.extractor || ""),
    uploader: info.uploader || info.channel || null,
    webpageUrl: info.webpage_url || normalizedUrl,
    formats,
  };
};

const streamVideo = async ({ url, formatId, downloadTitle, res, next }) => {
  const normalizedUrl = ensureUrl(url);
  const fileName = sanitizeFileName(downloadTitle || "video-download");

  try {
    if (isTikTokUrl(normalizedUrl) && process.env.TIKTOK_FALLBACK_DISABLED !== "true") {
      await streamTikTokFallbackVideo({
        url: normalizedUrl,
        formatId,
        fileName: `${fileName}.mp4`,
        res,
        next,
      });
      return;
    }

    await streamYtdlpVideo({
      url: normalizedUrl,
      formatId,
      fileName: `${fileName}.mp4`,
      res,
      next,
    });
  } catch (error) {
    if (res.headersSent) {
      res.destroy(error);
      return;
    }

    next(error);
  }
};

const streamAudio = async ({ url, res, next }) => {
  const normalizedUrl = ensureUrl(url);
  const info = await getVideoInfo(normalizedUrl);
  const fileName = sanitizeFileName(info.title);

  try {
    const filePath =
      info.source === "tiktok-fallback"
        ? await downloadTikTokFallbackAudio({
            url: normalizedUrl,
          })
        : await downloadYtdlpAudio({
            url: normalizedUrl,
          });

    await sendDownloadedFile({
      filePath,
      fileName: `${fileName}.mp3`,
      contentType: "audio/mpeg",
      res,
      next,
    });
  } catch (error) {
    next(error);
  }
};

const getTikTokFallbackData = async (url) => {
  const cached = tiktokCache.get(url);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const response = await fetch(
    `https://www.tikwm.com/api/?${new URLSearchParams({ url, hd: "1" })}`,
    { signal: AbortSignal.timeout(20000) }
  );

  if (!response.ok) {
    const error = new Error("TikTok fallback service is unavailable right now.");
    error.statusCode = 502;
    throw error;
  }

  const payload = await response.json();

  if (payload.code !== 0 || !payload.data) {
    const error = new Error(payload.msg || "Unable to extract this TikTok video.");
    error.statusCode = 422;
    throw error;
  }

  tiktokCache.set(url, {
    data: payload.data,
    expiresAt: Date.now() + tiktokCacheTtlMs,
  });

  return payload.data;
};

const getTikTokFallbackInfo = async (url) => {
  const data = await getTikTokFallbackData(url);
  const formats = [
    data.hdplay && {
      formatId: "tiktok_hd",
      quality: "HD",
      ext: "mp4",
      filesize: data.hd_size,
      hasAudio: true,
      hasVideo: true,
    },
    data.play && {
      formatId: "tiktok_sd",
      quality: "Standard",
      ext: "mp4",
      filesize: data.size,
      hasAudio: true,
      hasVideo: true,
    },
    data.wmplay && {
      formatId: "tiktok_watermark",
      quality: "Watermark",
      ext: "mp4",
      filesize: data.wm_size,
      hasAudio: true,
      hasVideo: true,
    },
  ].filter(Boolean);

  return {
    success: true,
    source: "tiktok-fallback",
    title: data.title || "TikTok video",
    thumbnail: data.cover || data.origin_cover || null,
    duration: data.duration || null,
    platform: "TikTok",
    uploader: data.author?.nickname || data.author?.unique_id || null,
    webpageUrl: url,
    formats,
  };
};

const getTikTokMediaUrl = async ({ url, formatId }) => {
  const data = await getTikTokFallbackData(url);
  const mediaUrl =
    formatId === "tiktok_sd"
      ? data.play
      : formatId === "tiktok_watermark"
        ? data.wmplay
        : data.hdplay || data.play || data.wmplay;

  if (!mediaUrl) {
    const error = new Error("No downloadable TikTok video format was found.");
    error.statusCode = 422;
    throw error;
  }

  return mediaUrl;
};

const createDownloadPath = async () => {
  await fs.promises.mkdir(tempDir, { recursive: true });
  return path.join(tempDir, `download-${Date.now()}-${crypto.randomUUID()}`);
};

const removeFile = async (filePath) => {
  if (!filePath) {
    return;
  }

  try {
    await fs.promises.unlink(filePath);
  } catch (_error) {
    // The temp file may already be gone if the process failed before creating it.
  }
};

const waitForProcess = (subprocess) =>
  new Promise((resolve, reject) => {
    subprocess.then(resolve).catch(reject);
  });

const findDownloadedFile = async (basePath) => {
  const directory = path.dirname(basePath);
  const filePrefix = path.basename(basePath);
  const entries = await fs.promises.readdir(directory);
  const candidates = entries
    .filter((entry) => entry.startsWith(filePrefix) && !entry.endsWith(".part") && !entry.endsWith(".ytdl"))
    .map((entry) => path.join(directory, entry));

  for (const candidate of candidates) {
    const stats = await fs.promises.stat(candidate);

    if (stats.isFile() && stats.size > 0) {
      return candidate;
    }
  }

  return null;
};

const assertPlayableOutput = async (filePath) => {
  if (!filePath) {
    const error = new Error("The download completed without producing a video file.");
    error.statusCode = 502;
    throw error;
  }

  const stats = await fs.promises.stat(filePath);

  if (!stats.isFile() || stats.size < 1024) {
    await removeFile(filePath);

    const error = new Error("The downloaded file is empty or incomplete.");
    error.statusCode = 502;
    throw error;
  }
};

const prepareStreamingDownload = ({ res, fileName, contentType = "video/mp4", contentLength }) => {
  res.setHeader("Content-Disposition", createContentDisposition(fileName));
  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Accel-Buffering", "no");

  if (contentLength) {
    res.setHeader("Content-Length", contentLength);
  }

  if (typeof res.flushHeaders === "function") {
    res.flushHeaders();
  }
};

const streamYtdlpVideo = async ({ url, formatId, fileName, res, next }) => {
  const format = formatId
    ? `${formatId}/best[ext=mp4][vcodec!=none][acodec!=none]/best[ext=mp4]/best[vcodec!=none][acodec!=none]`
    : "best[ext=mp4][vcodec!=none][acodec!=none]/best[ext=mp4]/best[vcodec!=none][acodec!=none]";

  try {
    const mediaUrl = await ytdlp(url, {
      ...getYtdlpFlags(),
      getUrl: true,
      format,
    });
    const directUrl = String(mediaUrl).trim().split("\n").filter(Boolean)[0];

    if (!directUrl) {
      const error = new Error("No direct downloadable media stream was found.");
      error.statusCode = 422;
      throw error;
    }

    const mediaResponse = await fetch(directUrl, {
      headers: { "user-agent": baseYtdlpFlags.userAgent },
      signal: AbortSignal.timeout(30000),
    });

    if (!mediaResponse.ok || !mediaResponse.body) {
      const error = new Error("Unable to open the direct media stream.");
      error.statusCode = 502;
      throw error;
    }

    prepareStreamingDownload({
      res,
      fileName,
      contentType: mediaResponse.headers.get("content-type") || "video/mp4",
      contentLength: mediaResponse.headers.get("content-length"),
    });

    Readable.fromWeb(mediaResponse.body).on("error", (error) => res.destroy(error)).pipe(res);
  } catch (error) {
    if (res.headersSent) {
      res.destroy(error);
      return;
    }

    next(normalizeYtdlpError(error));
  }
};

const downloadYtdlpVideo = async ({ url, formatId }) => {
  const basePath = await createDownloadPath();
  const outputTemplate = `${basePath}.%(ext)s`;
  const format = formatId
    ? `${formatId}+bestaudio[ext=m4a]/${formatId}/bestvideo[vcodec^=avc1]+bestaudio[ext=m4a]/best[ext=mp4]/best`
    : "bestvideo[ext=mp4][vcodec^=avc1]+bestaudio[ext=m4a]/best[ext=mp4][vcodec^=avc1]/bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best";
  let stderr = "";

  try {
    const subprocess = ytdlp.exec(url, {
      ...getYtdlpFlags(),
      output: outputTemplate,
      format,
      mergeOutputFormat: "mp4",
      recodeVideo: "mp4",
      noProgress: true,
    });

    subprocess.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    await waitForProcess(subprocess);

    const filePath = await findDownloadedFile(basePath);
    await assertPlayableOutput(filePath);

    return filePath;
  } catch (error) {
    const files = await fs.promises.readdir(tempDir).catch(() => []);
    await Promise.all(
      files
        .filter((file) => file.startsWith(path.basename(basePath)))
        .map((file) => removeFile(path.join(tempDir, file)))
    );

    error.stderr = error.stderr || stderr;
    throw normalizeYtdlpError(error);
  }
};

const downloadYtdlpAudio = async ({ url }) => {
  const basePath = await createDownloadPath();
  const outputTemplate = `${basePath}.%(ext)s`;
  let stderr = "";

  try {
    const subprocess = ytdlp.exec(url, {
      ...getYtdlpFlags(),
      output: outputTemplate,
      format: "bestaudio/best",
      extractAudio: true,
      audioFormat: "mp3",
      audioQuality: 0,
      noProgress: true,
    });

    subprocess.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    await waitForProcess(subprocess);

    const filePath = await findDownloadedFile(basePath);
    await assertPlayableOutput(filePath);

    return filePath;
  } catch (error) {
    const files = await fs.promises.readdir(tempDir).catch(() => []);
    await Promise.all(
      files
        .filter((file) => file.startsWith(path.basename(basePath)))
        .map((file) => removeFile(path.join(tempDir, file)))
    );

    error.stderr = error.stderr || stderr;
    throw normalizeYtdlpError(error);
  }
};

const runFfmpeg = (args) =>
  new Promise((resolve, reject) => {
    const process = spawn(ffmpegPath || "ffmpeg", args, { windowsHide: true });
    let stderr = "";

    process.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    process.on("error", reject);
    process.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      const error = new Error(stderr.trim().split("\n").pop() || "Unable to convert media");
      error.stderr = stderr;
      error.statusCode = 502;
      reject(error);
    });
  });

const downloadTikTokFallbackVideo = async ({ url, formatId }) => {
  const mediaUrl = await getTikTokMediaUrl({ url, formatId });
  const basePath = await createDownloadPath();
  const filePath = `${basePath}.mp4`;

  try {
    const mediaResponse = await fetch(mediaUrl, {
      headers: { "user-agent": baseYtdlpFlags.userAgent },
      signal: AbortSignal.timeout(30000),
    });

    const contentType = mediaResponse.headers.get("content-type") || "";

    if (
      !mediaResponse.ok ||
      !mediaResponse.body ||
      (!contentType.includes("video") && !contentType.includes("octet-stream"))
    ) {
      const error = new Error("Unable to download this TikTok video right now.");
      error.statusCode = 502;
      throw error;
    }

    await new Promise((resolve, reject) => {
      const fileStream = fs.createWriteStream(filePath);

      fileStream.on("finish", resolve);
      fileStream.on("error", reject);
      Readable.fromWeb(mediaResponse.body).on("error", reject).pipe(fileStream);
    });

    await assertPlayableOutput(filePath);
    return filePath;
  } catch (error) {
    await removeFile(filePath);
    throw error;
  }
};

const streamTikTokFallbackVideo = async ({ url, formatId, fileName, res, next }) => {
  try {
    const mediaUrl = await getTikTokMediaUrl({ url, formatId });
    const mediaResponse = await fetch(mediaUrl, {
      headers: { "user-agent": baseYtdlpFlags.userAgent },
      signal: AbortSignal.timeout(30000),
    });

    const contentType = mediaResponse.headers.get("content-type") || "";

    if (
      !mediaResponse.ok ||
      !mediaResponse.body ||
      (!contentType.includes("video") && !contentType.includes("octet-stream"))
    ) {
      const error = new Error("Unable to download this TikTok video right now.");
      error.statusCode = 502;
      throw error;
    }

    prepareStreamingDownload({
      res,
      fileName,
      contentType: contentType.includes("video") ? contentType : "video/mp4",
      contentLength: mediaResponse.headers.get("content-length"),
    });

    Readable.fromWeb(mediaResponse.body).on("error", (error) => res.destroy(error)).pipe(res);
  } catch (error) {
    if (res.headersSent) {
      res.destroy(error);
      return;
    }

    next(error);
  }
};

const downloadTikTokFallbackAudio = async ({ url }) => {
  const videoPath = await downloadTikTokFallbackVideo({ url });
  const audioPath = `${await createDownloadPath()}.mp3`;

  try {
    await runFfmpeg(["-y", "-i", videoPath, "-vn", "-codec:a", "libmp3lame", "-q:a", "0", audioPath]);
    await assertPlayableOutput(audioPath);
    return audioPath;
  } catch (error) {
    await removeFile(audioPath);
    throw normalizeYtdlpError(error);
  } finally {
    await removeFile(videoPath);
  }
};

const sendDownloadedFile = async ({ filePath, fileName, contentType = "video/mp4", res, next }) => {
  const stats = await fs.promises.stat(filePath);
  let cleanedUp = false;

  const cleanup = async () => {
    if (cleanedUp) {
      return;
    }

    cleanedUp = true;
    await removeFile(filePath);
  };

  res.setHeader("Content-Disposition", createContentDisposition(fileName));
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Length", stats.size);

  const fileStream = fs.createReadStream(filePath);

  fileStream.on("error", async (error) => {
    await cleanup();
    if (error && !res.headersSent) {
      next(error);
    }
  });

  fileStream.on("close", cleanup);
  res.on("finish", cleanup);
  res.on("close", () => {
    if (!res.writableEnded) {
      fileStream.destroy();
    }
  });
  fileStream.pipe(res);
};

module.exports = {
  getFfmpegStatus,
  getVideoInfo,
  streamAudio,
  streamVideo,
  supportedPlatforms,
};
