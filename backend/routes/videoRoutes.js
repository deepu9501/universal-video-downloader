const express = require("express");
const {
  downloadAudio,
  downloadVideo,
  getInfo,
} = require("../controllers/videoController");

const router = express.Router();

router.get("/info", getInfo);
router.get("/validate", getInfo);
router.get("/download", downloadVideo);
router.get("/audio", downloadAudio);

module.exports = router;
