const sanitizeFileName = (value = "download") =>
  String(value)
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140) || "download";

module.exports = {
  sanitizeFileName,
};
