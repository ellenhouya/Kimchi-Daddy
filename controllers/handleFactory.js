const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const Booking = require("../models/bookingModel");
const Review = require("../models/reviewModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // for temp photo rendering (index.js 659)
    if (req.params.id === "userId") {
      return res.status(200).json({
        status: "success",
        data: {
          filename: req.file.filename,
        },
      });
    }

    // for photo update
    if (req.file) req.body.photo = req.file.filename;

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) return next(new AppError("No document found with that ID", 404));

    // for amin to update booking (index.js 795, booking.js 25);

    if (Model === Booking) {
      const booking = await Booking.findById(req.params.id);

      if (req.body.quantities.length) {
        booking.products.forEach((product, index) => {
          product.quantity = req.body.quantities[index];
        });
      }

      await booking.save();
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    if (!req.body.user) req.body.user = req.user._id;

    const doc = await Model.create(req.body);

    // need to get order id (req.body.order: review.js 16)
    // need to find the order and update submitted
    if (doc.order) {
      // for review submission (update submitted property in booking products array)
      await Booking.findOneAndUpdate(
        {
          _id: doc.order,
          products: {
            $elemMatch: {
              _id: doc.product,
            },
          },
        },
        {
          $set: {
            "products.$.reviewSubmitted": true,
            "products.$.review": doc._id,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );
    }

    res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) return next(new AppError("No document found with that ID", 404));

    // REVIEW
    if (Model === Review) {
      const reviews = await Review.find().populate({
        path: "product",
        select: "name imageCover",
      });

      return res.status(200).json({
        status: "success",
        data: reviews,
      });
    }

    // USER
    if (Model === User) {
      const users = await User.find();

      return res.status(200).json({
        status: "success",
        data: users,
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc) return next(new AppError("No document found with that ID", 404));

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model, type = "api") =>
  catchAsync(async (req, res, next) => {
    let filter = {};

    if (req.params.productId) filter.product = req.params.productId;

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.query;

    if (type === "api") {
      res.status(200).json({
        status: "success",
        results: doc.length,
        data: {
          doc,
        },
      });
    } else {
      res
        .status(200)
        .set("Content-Security-Policy", "img-src 'self' data:")
        .render("overview", {
          title: "All Products",
          products: doc,
        });
    }
  });

// exports.getAll = (Model) =>
//   catchAsync(async (req, res, next) => {
//     let filter = {};

//     if (req.params.productId) filter.product = req.params.productId;

//     const features = new APIFeatures(Model.find(filter), req.query)
//       .filter()
//       .sort()
//       .limitFields()
//       .paginate();

//     const doc = await features.query;

//     res.status(200).json({
//       status: "success",
//       results: doc.length,
//       data: {
//         data: doc,
//       },
//     });
//   });
