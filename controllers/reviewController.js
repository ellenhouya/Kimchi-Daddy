const Review = require("../models/reviewModel");
const Booking = require("../models/bookingModel");
const catchAsync = require("../utils/catchAsync");
const {
  updateOne,
  createOne,
  deleteOne,
  getOne,
  getAll,
} = require("../controllers/handleFactory");

exports.setProductUserIds = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

exports.updateSubmitted = catchAsync(async (req, res, next) => {
  const reviewId = req.params.id;
  const orderId = req.query.order;

  await Booking.findOneAndUpdate(
    {
      _id: orderId,
      products: {
        $elemMatch: {
          review: reviewId,
        },
      },
    },
    {
      $set: {
        "products.$.reviewSubmitted": false,
      },
    }
  );

  next();
});

exports.getAllReviews = getAll(Review);
exports.createReview = createOne(Review);
exports.updateReview = updateOne(Review);
exports.deleteReview = deleteOne(Review);
exports.getReview = getOne(Review);
