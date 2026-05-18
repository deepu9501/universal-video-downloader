const sanitizeFileName = (value = "download") =>
  String(value)
    .replace(/[<>:"/\\|?*\x00-\x1F\x7F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140) || "download";

const toAsciiFileName = (fileName) => {
  const sanitized = sanitizeFileName(fileName)
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/["\\;]/g, "")
    .trim();

  return sanitized || "download.mp4";
};

const createContentDisposition = (fileName) => {
  const sanitized = sanitizeFileName(fileName);
  const asciiFileName = toAsciiFileName(sanitized);
  const encodedFileName = encodeURIComponent(sanitized).replace(
    /['()]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`
  );

  return `attachment; filename="${asciiFileName}"; filename*=UTF-8''${encodedFileName}`;
};

module.exports = {
  createContentDisposition,
  sanitizeFileName,
};
