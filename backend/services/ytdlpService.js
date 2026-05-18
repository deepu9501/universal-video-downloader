const { spawn } = require("child_process");
const { Readable } = require("stream");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStaticPath = require("ffmpeg-static");
const ytdlp = require("yt-dlp-exec");
const { sanitizeFileName } = require("../utils/file");
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

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

const baseYtdlpFlags = {
  noWarnings: true,
  noPlaylist: true,
  noCheckCertificates: true,
  userAgent: process.env.YTDLP_USER_AGENT || defaultUserAgent,
};

const tiktokCache = new Map();
const tiktokCacheTtlMs = 5 * 60 * 1000;

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
    const error = new Error("Unsupported platform. Only YouTube, Instagram, Facebook, and TikTok links are allowed.");
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
    error.message = "Unsupported link. Only YouTube, Instagram, Facebook, and TikTok links are allowed.";
    return error;
  }

  if (/private|login|sign in|cookies|not available|copyright|blocked|rate-limit|rate limit/i.test(message)) {
    error.statusCode = 422;
    error.message =
      "This media cannot be accessed publicly from the server. Try another public link or configure cookies.";
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

const streamVideo = async ({ url, formatId, res, next }) => {
  const normalizedUrl = ensureUrl(url);
  const info = await getVideoInfo(normalizedUrl);

  if (info.source === "tiktok-fallback") {
    await streamTikTokFallbackVideo({
      url: normalizedUrl,
      formatId,
      title: info.title,
      res,
      next,
    });
    return;
  }

  const fileName = sanitizeFileName(info.title);
  const format = formatId
    ? `${formatId}+bestaudio[ext=m4a]/${formatId}/best[ext=mp4]/best`
    : "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/bv*+ba/b";

  const subprocess = ytdlp.exec(normalizedUrl, {
    ...getYtdlpFlags(),
    output: "-",
    format,
    noProgress: true,
  });

  pipeMp4Process({
    subprocess,
    res,
    next,
    fileName: `${fileName}.mp4`,
  });
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

const streamTikTokFallbackVideo = async ({ url, formatId, title, res, next }) => {
  try {
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

    const mediaResponse = await fetch(mediaUrl, {
      headers: { "user-agent": baseYtdlpFlags.userAgent },
      signal: AbortSignal.timeout(30000),
    });

    if (!mediaResponse.ok || !mediaResponse.body) {
      const error = new Error("Unable to stream this TikTok video right now.");
      error.statusCode = 502;
      throw error;
    }

    res.setHeader("Content-Disposition", `attachment; filename="${sanitizeFileName(title)}.mp4"`);
    res.setHeader("Content-Type", mediaResponse.headers.get("content-type") || "video/mp4");
    Readable.fromWeb(mediaResponse.body).pipe(res);
  } catch (error) {
    next(error);
  }
};

const pipeMp4Process = ({ subprocess, res, next, fileName }) => {
  let stderr = "";
  let clientClosed = false;
  let errorHandled = false;

  const handleError = (error) => {
    if (errorHandled || clientClosed || res.headersSent) {
      return;
    }

    errorHandled = true;
    next(normalizeYtdlpError(error));
  };

  if (typeof subprocess.catch === "function") {
    subprocess.catch(handleError);
  }

  subprocess.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  subprocess.stdout.on("error", handleError);
  subprocess.on("error", handleError);
  subprocess.on("close", (code) => {
    if (code === 0 || clientClosed || res.headersSent) {
      return;
    }

    const error = new Error(stderr.trim().split("\n").pop() || "Unable to download this media");
    error.statusCode = 502;
    handleError(error);
  });

  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Content-Type", "video/mp4");
  res.on("error", () => {});

  const ffmpegCommand = ffmpeg(subprocess.stdout)
    .outputOptions(["-c copy", "-movflags frag_keyframe+empty_moov"])
    .format("mp4")
    .on("error", (error) => {
      if (clientClosed) {
        return;
      }

      error.message = stderr.trim().split("\n").pop() || error.message;
      handleError(error);
    });

  ffmpegCommand.pipe(res, { end: true });

  res.on("close", () => {
    clientClosed = true;
    subprocess.stdout.unpipe(res);

    try {
      ffmpegCommand.kill("SIGTERM");
    } catch (_error) {
      // FFmpeg may already be closed after the client disconnects.
    }

    if (!subprocess.killed && subprocess.exitCode === null) {
      try {
        subprocess.kill("SIGTERM", { forceKillAfterTimeout: 1000 });
      } catch (_error) {
        // The child may already be gone after the client disconnects.
      }
    }
  });
};

module.exports = {
  getFfmpegStatus,
  getVideoInfo,
  streamVideo,
};
