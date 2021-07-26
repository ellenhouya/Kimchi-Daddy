const express = require("express");

const router = express.Router();

const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
  addItemToMyCart,
  clearCartItems,
  deleteCartItem,
  uploadUserPhoto,
  // resizeUserPhoto,
  addToMyFavorite,
  deleteFavoriteProduct,
} = require("../controllers/userController");

const { resizePhoto } = require("../utils/resizePhoto");

const {
  signup,
  login,
  protect,
  forgotPassword,
  resetPassword,
  updatePassword,
  restrictTo,
  logout,
} = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

router.use(protect);

router.patch("/updateMyPassword", updatePassword);
router.patch("/updateMe", uploadUserPhoto, resizePhoto("user"), updateMe);
router.delete("/deleteMe", deleteMe);
router.get("/me", protect, getMe, getUser);
router.patch("/addItemToMyCart", addItemToMyCart);
router.delete("/clearCartItems", clearCartItems);
router.delete("/deleteCartItem", deleteCartItem);
router.patch("/addToMyFavorite", addToMyFavorite);
router.delete("/deleteFavoriteProduct/:productId", deleteFavoriteProduct);

router.use(restrictTo("admin"));

router.route("/").get(getAllUsers).post(createUser);

router
  .route("/:id")
  .get(getUser)
  .patch(uploadUserPhoto, resizePhoto("user"), updateUser)
  .delete(deleteUser);

module.exports = router;
