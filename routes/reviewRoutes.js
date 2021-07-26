const express = require("express");
const router = express.Router({ mergeParams: true });

const { protect, restrictTo } = require("../controllers/authController");

const {
  getAllReviews,
  createReview,
  getReview,
  updateReview,
  deleteReview,
  setProductUserIds,
  getReviewId,
  updateSubmitted,
} = require("../controllers/reviewController");

router.use(protect);

router
  .route("/")
  .get(getAllReviews)
  .post(restrictTo("user", "admin"), setProductUserIds, createReview);
// .post(restrictTo("user"), setProductUserIds, createReview);

router
  .route("/:id")
  .get(getReview)
  .patch(restrictTo("user", "admin"), updateReview)
  .delete(restrictTo("user", "admin"), updateSubmitted, deleteReview);

module.exports = router;
