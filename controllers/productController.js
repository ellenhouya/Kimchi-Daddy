const multer = require("multer");
const sharp = require("sharp");
const Product = require("../models/productModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");

const {
  updateOne,
  createOne,
  deleteOne,
  getOne,
  getAll,
} = require("../controllers/handleFactory");

// /////
const { upload } = require("../utils/resizePhoto");
exports.uploadProductImageCover_temp = upload.single("imageCover");
exports.uploadProductImages_temp = upload.single("images_1");
exports.uploadProductImages_temp2 = upload.single("images_2");
exports.uploadProductImages_temp3 = upload.single("images_3");
////////

exports.uploadProductImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images_1", maxCount: 1 },
  { name: "images_2", maxCount: 1 },
  { name: "images_3", maxCount: 1 },
]);

exports.uploadProductImages_add = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

exports.resizeProductImages = catchAsync(async (req, res, next) => {
  if (
    !req.files.imageCover &&
    !req.files.images_1 &&
    !req.files.images_2 &&
    !req.files.images_3
  )
    return next();

  //  image cover
  if (req.files.imageCover) {
    req.body.imageCover = `product-${req.params.id}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`public/img/products/${req.body.imageCover}`);
  }
  // Images
  const product = await Product.findById(req.params.id);

  req.body.images = product.images;

  if (req.files.images_1) {
    const filename = `product-${req.params.id}-${Date.now()}-1.jpeg`;

    await sharp(req.files.images_1[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`public/img/products/${filename}`);

    req.body.images[0] = filename;
  }
  if (req.files.images_2) {
    const filename = `product-${req.params.id}-${Date.now()}-2.jpeg`;

    await sharp(req.files.images_2[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`public/img/products/${filename}`);

    req.body.images[1] = filename;
  }
  if (req.files.images_3) {
    const filename = `product-${req.params.id}-${Date.now()}-3.jpeg`;

    await sharp(req.files.images_3[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`public/img/products/${filename}`);

    req.body.images[2] = filename;
  }

  next();
});

exports.resizeProductImages_add = catchAsync(async (req, res, next) => {
  //  image cover
  req.body.imageCover = `product-add-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 70 })
    .toFile(`public/img/products/${req.body.imageCover}`);

  // Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `product-add-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 70 })
        .toFile(`public/img/products/${filename}`);

      req.body.images.push(filename);
    })
  );

  req.body.images.sort();

  next();
});

exports.getAllProducts = getAll(Product, "renderedWebsite");

exports.getAllProducts_db = getAll(Product, "api");

exports.getProduct = getOne(Product, { path: "reviews" });

exports.createProduct = createOne(Product);

exports.updateProduct = updateOne(Product);

exports.deleteProduct = deleteOne(Product);

exports.top5Products = (req, res, next) => {
  req.query.sort = "-ratingsAverage, price";
  req.query.limit = 5;
  req.query.fields = "name,price,ratingsAverage,summary,ingridients,vegetarian";
  next();
};

exports.getProductStats = catchAsync(async (req, res, next) => {
  const stats = await Product.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },

    {
      $group: {
        _id: "$vegetarian",
        num: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPirce: { $min: "$price" },
        maxPirce: { $max: "$price" },
      },
    },

    {
      $sort: { avgPrice: 1 },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

exports.renderTemporaryImages = (req, res) => {
  // we get req.file from the previous middleware (resizePhoto("product") -> resizePhoto.js )
  res.status(200).json({
    status: "success",
    data: {
      // product.js 34 gets the response
      filename: req.file.filename,
    },
  });
};

// exports.priceLowToHigh = (req, res, next) => {
//   req.query.sort = "price -ratingsAverage";

//   next();
// };

// exports.priceHighToLow = (req, res, next) => {
//   req.query.sort = "-price -ratingsAverage";

//   next();
// };

// exports.ratingHighToLow = (req, res, next) => {
//   req.query.sort = "-ratingsAverage price";

//   next();
// };
