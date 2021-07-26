const express = require("express");

const {
  getHomepage,
  getOverview,
  getProduct,
  getLoginForm,
  getSignupForm,
  getAccount,
  getMyOrders,
  getMyFavoriteProducts,
  getReviewForm,
  getReviewUpdateForm,
  getMyReviews,
  manageProductsForm,
  createProductForm,
  getUsersForm,
  userUpdateForm,
  getAllReviews,
  getReviewUpdateForm_admin,
  getAllOrders_admin,
  updateOrder_admin,
  alerts,
} = require("../controllers/viewsController");

const {
  isLoggedIn,
  protect,
  restrictTo,
} = require("../controllers/authController");

const { createBookingCheckout } = require("../controllers/bookingController");
const { getAllProducts } = require("../controllers/productController");

const router = express.Router();

router.use(alerts);

router.get("/", isLoggedIn, getHomepage);

router.get(
  "/all-products",
  // createBookingCheckout,
  isLoggedIn,
  getOverview
);

router.get("/product/:eng", isLoggedIn, getProduct);

router.get("/login", isLoggedIn, getLoginForm);

router.get("/signup", isLoggedIn, getSignupForm);

router.get("/me", protect, getAccount);

router.get("/orders", protect, getMyOrders);

router.get("/my-favorite-products", protect, getMyFavoriteProducts);

router.get("/my-reviews", protect, getMyReviews);

router.get("/review-form/:productId/:orderId", protect, getReviewForm);

router.get(
  "/review-update-form/:productId/:reviewId",
  protect,
  getReviewUpdateForm
);

router.get("/manage-products", protect, manageProductsForm);

router.get(
  "/add-product-form",
  protect,
  restrictTo("admin"),
  createProductForm
);

router.get(
  "/user-update-form/:userId",
  protect,
  restrictTo("admin"),
  userUpdateForm
);

router.get("/manage-reviews", protect, restrictTo("admin"), getAllReviews);

router.get("/manage-users", protect, restrictTo("admin"), getUsersForm);

router.get(
  "/review-update-form-admin/:reviewId",
  protect,
  restrictTo("admin"),
  getReviewUpdateForm_admin
);

router.get(
  "/manage-bookings",
  protect,
  restrictTo("admin"),
  getAllOrders_admin
);

router.get(
  "/update-booking/:bookingId",
  protect,
  restrictTo("admin"),
  updateOrder_admin
);

const setQuery = (req, res, next) => {
  // { sort: '-price', price: { lte: '40' }, vegetarian: 'false' }

  if (req.params.sort !== "undefined") req.query.sort = req.params.sort;

  if (req.params.price !== "undefined")
    req.query.price = { lte: req.params.price.split("=")[1] };

  if (req.params.vegetarian !== "undefined")
    req.query.vegetarian = req.params.vegetarian.split("=")[1];

  next();
};

router.get(
  "/sort-filter-products/:sort/:price/:vegetarian",
  isLoggedIn,
  setQuery,
  getAllProducts
);

module.exports = router;
