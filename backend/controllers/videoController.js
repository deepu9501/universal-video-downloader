const {
  getVideoInfo,
  streamAudio,
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
      downloadTitle: req.query.title,
      res,
      next,
    });
  } catch (error) {
    next(error);
  }
};

const downloadAudio = async (req, res, next) => {
  try {
    await streamAudio({
      url: req.query.url,
      res,
      next,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  downloadAudio,
  downloadVideo,
  getInfo,
};
