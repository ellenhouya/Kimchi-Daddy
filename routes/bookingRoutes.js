const express = require("express");

const {
  getCheckoutSession,
  getAllBookings,
  createBooking,
  getBooking,
  updateBooking,
  deleteBooking,
} = require("../controllers/bookingController");

const { protect, restrictTo } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.get("/checkout-session/:total/:pickupTime", getCheckoutSession);

// ADMIN ONLY
router.use(restrictTo("admin"));

router.route("/").get(getAllBookings).post(createBooking);
router.route("/:id").get(getBooking).patch(updateBooking).delete(deleteBooking);

module.exports = router;
