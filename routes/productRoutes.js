const express = require("express");

const reviewRouter = require("../routes/reviewRoutes");
const router = express.Router();

const {
  getAllProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  top5Products,
  getProductStats,
  uploadProductImages,
  resizeProductImages,
  renderTemporaryImages,

  uploadProductImageCover_temp,
  uploadProductImages_temp,
  uploadProductImages_temp2,
  uploadProductImages_temp3,

  uploadProductImages_add,
  resizeProductImages_add,

  getAllProducts_db,
} = require("../controllers/productController");

const { protect, restrictTo } = require("../controllers/authController");

const { resizePhoto } = require("../utils/resizePhoto");

router.use("/:productId/reviews", reviewRouter);

router.get("/top-5-cheap", top5Products, getAllProducts);

router.get("/product-stats", getProductStats);

router.get("/all-products-db", getAllProducts_db);

router
  .route("/")
  .get(getAllProducts)
  .post(
    protect,
    restrictTo("admin"),
    uploadProductImages_add,
    resizeProductImages_add,
    createProduct
  );

router
  .route("/:id")
  .get(getProduct)
  .patch(
    protect,
    restrictTo("admin"),
    uploadProductImages,
    resizeProductImages,
    updateProduct
  )
  .delete(protect, restrictTo("admin"), deleteProduct);

// Temp images //
router.use(protect, restrictTo("admin"));

router.patch(
  "/renderTempImageCover/:productId",
  uploadProductImageCover_temp,
  resizePhoto("product"),
  renderTemporaryImages
);

router.patch(
  "/renderTempImage/:productId",
  uploadProductImages_temp,
  resizePhoto("product"),
  renderTemporaryImages
);

router.patch(
  "/renderTempImage2/:productId",
  uploadProductImages_temp2,
  resizePhoto("product"),
  renderTemporaryImages
);

router.patch(
  "/renderTempImage3/:productId",
  uploadProductImages_temp3,
  resizePhoto("product"),
  renderTemporaryImages
);

// SORT AND FILTER

//

module.exports = router;
