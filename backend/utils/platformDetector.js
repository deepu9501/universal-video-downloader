const normalizeUrl = (url = "") => String(url).trim();

const hostMatches = (hostname, domains) =>
  domains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));

const isValidHttpUrl = (url) => {
  try {
    const parsed = new URL(normalizeUrl(url));
    return ["http:", "https:"].includes(parsed.protocol);
  } catch (_error) {
    return false;
  }
};

const detectPlatform = (url = "", extractor = "") => {
  const normalizedUrl = normalizeUrl(url);

  try {
    const parsed = new URL(normalizedUrl);
    const hostname = parsed.hostname.replace(/^www\./, "").toLowerCase();
    const pathname = parsed.pathname.toLowerCase();

    if (hostMatches(hostname, ["youtube.com"]) && pathname.startsWith("/shorts/")) {
      return "YouTube Shorts";
    }

    if (hostMatches(hostname, ["youtube.com", "youtu.be"])) return "YouTube";
    if (hostMatches(hostname, ["instagram.com"]) && pathname.startsWith("/reel/")) return "Instagram Reels";
    if (hostMatches(hostname, ["instagram.com"])) return "Instagram";
    if (hostMatches(hostname, ["facebook.com", "fb.watch"])) return "Facebook";
    if (hostMatches(hostname, ["tiktok.com", "vm.tiktok.com", "vt.tiktok.com"])) return "TikTok";
    if (hostMatches(hostname, ["x.com", "twitter.com"])) return "Twitter/X";
  } catch (_error) {
    // Fall back to extractor metadata below.
  }

  const key = String(extractor).toLowerCase();

  if (key.includes("youtube")) return "YouTube";
  if (key.includes("instagram")) return "Instagram";
  if (key.includes("facebook")) return "Facebook";
  if (key.includes("tiktok")) return "TikTok";
  if (key.includes("twitter") || key.includes("x.com")) return "Twitter/X";

  return "Unknown";
};

const isSupportedPlatform = (url) => {
  const platform = detectPlatform(url);
  return ["YouTube", "YouTube Shorts", "Instagram Reels", "Instagram", "Facebook", "TikTok", "Twitter/X"].includes(platform);
};

module.exports = {
  detectPlatform,
  isValidHttpUrl,
  isSupportedPlatform,
  normalizeUrl,
};
