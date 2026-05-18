const {
  getVideoInfo,
  streamVideo,
} = require("../services/ytdlpService");

const getInfo = async (req, res, next) => {
  try {
    const info = await getVideoInfo(req.query.url);
    res.json(info);
  } catch (error) {
    next(error);
  }
};

const downloadVideo = async (req, res, next) => {
  try {
    await streamVideo({
      url: req.query.url,
      formatId: req.query.format,
      res,
      next,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  downloadVideo,
  getInfo,
};
