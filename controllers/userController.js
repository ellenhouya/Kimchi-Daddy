const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const {
  updateOne,
  deleteOne,
  getOne,
  getAll,
} = require("../controllers/handleFactory");

const { upload } = require("../utils/resizePhoto");

const filterObj = (reqBody, ...fields) => {
  const obj = {};

  Object.keys(reqBody).forEach((field) => {
    if (fields.includes(field)) obj[field] = reqBody[field];
  });

  return obj;
};

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/img/users");
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

exports.uploadUserPhoto = upload.single("photo");

// exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
//   if (!req.file) return next();

//   req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

//   await sharp(req.file.buffer)
//     .resize(500, 500)
//     .toFormat("jpeg")
//     .jpeg({ quality: 90 })
//     .toFile(`public/img/users/${req.file.filename}`);

//   next();
// });

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined! Please use /signup instead",
  });
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

exports.getAllUsers = getAll(User);

exports.getUser = getOne(User);

exports.updateUser = updateOne(User);

exports.deleteUser = deleteOne(User);

exports.updateMe = catchAsync(async (req, res, next) => {
  // temporary rendering before saving the image (index 218, 223)
  if (req.body.photoRendering) {
    return res.status(200).json({
      status: "success",
      data: {
        fileName: req.file.filename,
      },
    });
  }

  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword",
        400
      )
    );

  const filteredBody = filterObj(req.body, "name", "email");

  if (req.file) filteredBody.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    user: updatedUser,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.addItemToMyCart = catchAsync(async (req, res, next) => {
  const name = req.body.name;

  const user = await User.findById(req.user._id);

  const duplicateItem = user.shoppingCart.some((item) => item.name === name);

  if (duplicateItem) {
    const itemIndex = user.shoppingCart.findIndex((obj) => obj.name === name);

    if (req.body.fromInput) {
      user.shoppingCart[itemIndex].quantity = req.body.quantity;
    } else {
      user.shoppingCart[itemIndex].quantity += req.body.quantity;
    }
  } else {
    user.shoppingCart.push(req.body);
  }

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.clearCartItems = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      shoppingCart: [],
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.deleteCartItem = catchAsync(async (req, res, next) => {
  // itemId
  const productId = req.body._id;

  const user = await User.findById(req.user._id);

  const shoppingCart = user.shoppingCart.filter((item) => {
    return item._id.toString() !== productId;
  });

  // await user.updateOne({
  //   $pull: { shoppingCart: { _id } },
  // });

  // const user = await User.updateOne(
  //   {
  //     _id: req.user._id,
  //   },

  //   {
  //     $pull: { shoppingCart: { _id } },
  //   }
  // );

  user.shoppingCart = shoppingCart;

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.addToMyFavorite = catchAsync(async (req, res, next) => {
  const { productId } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    // favoriteProducts: { $push: mongoose.Types.ObjectId(productId) },
    { $addToSet: { favoriteProducts: productId } },
    {
      new: true,
      runValidators: true,
      // sets the document fields to return
      select: "favoriteProducts",
    }
  );

  res.status(200).json({
    status: "success",
    data: {
      updatedUser,
    },
  });
});

exports.deleteFavoriteProduct = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  // will be populated because of pre find middleware in userModel
  const user = await User.findById(req.user._id).populate("favoriteProducts");

  const favoriteProducts = user.favoriteProducts.filter(
    (item) => item._id.toString() !== productId
  );
  user.favoriteProducts = user.favoriteProducts.filter(
    (item) => item._id.toString() !== productId
  );

  // after we save the user, favoriteProducts will become objectId again, so we need to line 241 to save populated favoriteProducts
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    data: {
      favoriteProducts,
    },
  });
});
