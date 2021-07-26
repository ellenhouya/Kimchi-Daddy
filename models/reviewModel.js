const mongoose = require("mongoose");
const Product = require("../models/productModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review cannot be empty."],
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },

    updatedAt: {
      type: Date,
      // default: Date.now(),
    },

    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "Review must belong to a product"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },

    order: {
      type: mongoose.Schema.ObjectId,
      ref: "Booking",
      required: [true, "Review must belong to a booking"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// same user cannot submit a review on the same item
// reviewSchema.index({ product: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });

  next();
});

reviewSchema.statics.calcAverageRatings = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: "$product",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length) {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post(/^findOneAnd/, async function (doc, next) {
  if (doc) await doc.constructor.calcAverageRatings(doc.product);

  next();
});

reviewSchema.post("save", function (docs, next) {
  this.constructor.calcAverageRatings(this.product);

  next();
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
