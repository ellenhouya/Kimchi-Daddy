const catchAsync = require("./catchAsync");
const sharp = require("sharp");
const multer = require("multer");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Please upload only images", 400), false);
  }
};

exports.upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.resizePhoto = (type) =>
  catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    // we attach filename on req.file because req.file will be passed to next function (userController.js 90)

    req.file.filename = `${type}-${
      type === "product" ? req.params.productId : req.user.id
    }-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
      .resize(200, 200)
      .toFormat("jpeg")
      .jpeg({ quality: 70 })
      .toFile(`public/img/${type}s/${req.file.filename}`);

    next();
  });
