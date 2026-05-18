const express = require("express");
const {
  downloadVideo,
  getInfo,
} = require("../controllers/videoController");

const router = express.Router();

router.get("/info", getInfo);
router.get("/validate", getInfo);
router.get("/download", downloadVideo);

module.exports = router;
