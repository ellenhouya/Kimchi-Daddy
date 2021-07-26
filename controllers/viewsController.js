const Product = require("../models/productModel");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const Review = require("../models/reviewModel");
const Booking = require("../models/bookingModel");
const AppError = require("../utils/appError");

exports.getHomepage = catchAsync(async (req, res, next) => {
  const products = await Product.find();

  res
    .status(200)
    .set("Content-Security-Policy", "img-src 'self' data:")
    .render("homepage", {
      title: "A healthy start to the day.",
      products,
    });
});

exports.getOverview = catchAsync(async (req, res, next) => {
  const products = await Product.find();
  res
    .status(200)
    .set("Content-Security-Policy", "img-src 'self' data:")
    .render("overview", {
      title: "All Products",
      products,
    });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({ eng: req.params.eng });
  const reviews = await Review.find({ product });
  const users = await Promise.all(
    reviews.map(async (review) => await User.findById(review.user))
  );

  if (!product) return next(new AppError("無法找到該產品名稱", 404));

  res
    .status(200)
    .set("Content-Security-Policy", "img-src 'self' data:")
    .render("product", {
      title: product.name,
      product,
      reviews,
      users,
    });
});

exports.getLoginForm = (req, res, next) => {
  res
    .status(200)
    .set("Content-Security-Policy", "img-src 'self' data:")
    .render("login", {
      title: "Log into your account",
    });
};

exports.getSignupForm = (req, res) => {
  res
    .status(200)
    .set("Content-Security-Policy", "img-src 'self' data:")
    .render("signup", {
      title: "Create your acount",
    });
};

exports.getAccount = (req, res) => {
  res
    .status(200)
    .set("Content-Security-Policy", "img-src 'self' data:")
    .render("account", {
      title: "My account",
    });
};

exports.getMyOrders = catchAsync(async (req, res, next) => {
  const orders = await Booking.find({ user: req.user._id });

  res
    .status(200)
    .set("Content-Security-Policy", "img-src 'self' data:")
    .render("booking", {
      title: "My orders",
      orders,
    });
});

exports.getMyFavoriteProducts = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res
    .status(200)
    .set("Content-Security-Policy", "img-src 'self' data:")
    .render("overview", {
      title: "My Favorite Products",
      products: user.favoriteProducts,
    });
});

exports.getReviewForm = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);
  const orderId = req.params.orderId;

  res
    .status(200)
    .set("Content-Security-Policy", "img-src 'self' data:")
    .render("review", {
      title: "Write a Review",
      product,
      orderId,
    });
});

exports.getReviewUpdateForm = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);
  // const review = await Review.findOne({
  //   product: req.params.productId,
  //   user: req.user._id,
  //   review: req.params.orderId,
  // });
  const review = await Review.findById(req.params.reviewId);

  res
    .status(200)
    .set("Content-Security-Policy", "img-src 'self' data:")
    .render("updateReview_form", {
      title: "Update Review",
      product,
      review,
    });
});

exports.getMyReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({ user: req.user._id });
  const products = await Promise.all(
    reviews.map(async (obj) => await Product.findById(obj.product))
  );

  res
    .status(200)
    .set("Content-Security-Policy", "img-src 'self' data:")
    .render("myReviews", {
      title: "My Reviews",
      reviews,
      products,
    });
});

exports.manageProductsForm = catchAsync(async (req, res, next) => {
  const products = await Product.find();

  res
    .status(200)
    .set("Content-Security-Policy", "img-src 'self' data:")
    .render("manageProducts", {
      title: "Manage Products",
      products,
    });
});

exports.createProductForm = (req, res) => {
  res
    .status(200)
    .set("Content-Security-Policy", "img-src 'self' data:")
    .render("addProduct", {
      title: "Add Product",
    });
};

exports.getUsersForm = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res
    .status(200)
    .set("Content-Security-Policy", "img-src 'self' data:")
    .render("users", {
      title: "All Users",
      users,
    });
});

exports.userUpdateForm = catchAsync(async (req, res, next) => {
  const user_nonAdmin = await User.findById(req.params.userId);
  res
    .status(200)
    .set("Content-Security-Policy", "img-src 'self' data:")
    .render("users", {
      title: "Update User",
      user_nonAdmin,
    });
});

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find().populate({
    path: "user",
    select: "photo name _id",
  });

  const users = reviews.map((review) => review.user);

  const productIds = reviews.map((review) => review.product);

  const products = await Promise.all(
    productIds.map(async (id) => await Product.findById(id))
  );

  res
    .status(200)
    .set("Content-Security-Policy", "img-src 'self' data:")
    .render("reviews", {
      title: "Reviews",
      reviews,
      users,
      products,
    });
});

exports.getReviewUpdateForm_admin = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.reviewId)
    .populate({
      path: "user",
      select: "name photo",
    })
    .populate({
      path: "product",
      select: "name imageCover",
    });

  res
    .status(200)
    .set("Content-Security-Policy", "img-src 'self' data:")
    .render("reviewUpdate_admin", {
      title: "Update Review",
      review,
    });
});

exports.getAllOrders_admin = catchAsync(async (req, res, next) => {
  const orders = await Booking.find();

  res
    .status(200)
    .set("Content-Security-Policy", "img-src 'self' data:")
    .render("bookings_admin", {
      title: "All Orders",
      orders,
    });
});

exports.updateOrder_admin = catchAsync(async (req, res, next) => {
  const order = await Booking.findById(req.params.bookingId);

  res
    .status(200)
    .set("Content-Security-Policy", "img-src 'self' data:")
    .render("updateBooking_admin", {
      title: "Update Order",
      order,
    });
});

exports.alerts = (req, res, next) => {
  const { alert } = req.query;

  if (alert === "booking")
    res.locals.alert =
      "成功訂購！請至信箱確認（若沒有收到信件，請稍候再次確認）。";

  next();
};
