const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const mongoose = require("mongoose");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const Booking = require("../models/bookingModel");

const AppError = require("../utils/appError");

const {
  updateOne,
  createOne,
  deleteOne,
  getOne,
  getAll,
} = require("../controllers/handleFactory");

const catchAsync = require("../utils/catchAsync");

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],

    success_url: `${req.protocol}://${req.get(
      "host"
    )}/all-products?alert=booking`,

    // success_url: `${req.protocol}://${req.get("host")}/all-products?user=${
    //   req.user._id
    // }`,

    metadata: {
      pickupTime: req.params.pickupTime,
    },

    cancel_url: `${req.protocol}://${req.get("host")}/all-products`,

    customer_email: req.user.email,

    client_reference_id: req.user._id.toString(),

    line_items: [
      {
        // all the property names come from stripe
        // name: "kimchi daddy",
        name: req.user.shoppingCart.map((item) => item.name).join("、"),
        // description: product.summary,
        // images: [
        //   `${req.protocol}://${req.get(
        //     "host"
        //   )}/img/products/product-5c88fa8cf4afda39709c2955-1626283605390-cover.jpeg`,
        // ],
        amount: req.params.total * 100, // the unit is cents so we need to multiply by 100
        currency: "twd",
        quantity: 1,
      },
    ],
  });

  res.status(200).json({
    status: "success",
    session,
  });
});

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   const userId = req.query.user;

//   if (!userId) return next();

//   const user = await User.findById(userId);

//   const products = user.shoppingCart.map((item) => {
//     const { quantity, _id, name, price, image } = item;
//     return { quantity, _id, name, price, image };
//   });

//   await Booking.create({ products, user: userId });

//   // clear cart in DB after checkout successfully (use webhook)

//   await User.findByIdAndUpdate(userId, {
//     shoppingCart: [],
//   });

//   res.redirect(req.originalUrl.split("?")[0]);
// });

const createBookingCheckout = async (session) => {
  const userId = session.client_reference_id;

  const user = await User.findById(userId);

  const products = user.shoppingCart.map((item) => {
    const { quantity, _id, name, price, image } = item;
    return { quantity, _id, name, price, image };
  });

  await Booking.create({
    products,
    user: userId,
    pickupTime: session.metadata.pickupTime,
    // createdAt,
  });

  // clear cart in DB after checkout successfully (use webhook)

  await User.findByIdAndUpdate(userId, {
    shoppingCart: [],
  });
};

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    createBookingCheckout(event.data.object);
  }

  res.status(200).json({ received: true });
};

exports.createBooking = createOne(Booking);
exports.getAllBookings = getAll(Booking);
exports.getBooking = getOne(Booking);
exports.updateBooking = updateOne(Booking);
exports.deleteBooking = deleteOne(Booking);
