const mongoose = require("mongoose");
const bookingShema = new mongoose.Schema({
  products: [
    {
      quantity: Number,
      name: String,
      price: Number,
      image: String,
      reviewSubmitted: {
        type: Boolean,
        default: false,
      },
      review: {
        type: mongoose.Schema.ObjectId,
        ref: "Review",
      },
    },
  ],
  //   products: [
  //     {
  //       type: mongoose.Schema.ObjectId,
  //       ref: "Product",
  //       required: [true, "Booking must belong to a Product"],
  //     },
  //   ],

  //   quantity: {
  //     type: Number,
  //     required: [true, "Booking must have a quantity."],
  //   },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Booking must belong to a User"],
  },

  createdAt: {
    type: Date,
    default: new Date().toLocaleString("en-US", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    // default: Date.now(),
  },

  updatedAt: {
    type: Date,
  },

  paid: {
    type: Boolean,
    default: true,
  },

  pickupTime: {
    type: String,
    required: [true, "Please provide a pickup time"],
  },
});

const Booking = mongoose.model("Booking", bookingShema);

module.exports = Booking;
