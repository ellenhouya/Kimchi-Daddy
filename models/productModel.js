const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      unique: true,
      trim: true,
    },

    eng: {
      type: String,
      required: [true, "Please provide a name in ENG"],
      unique: true,
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "Please provide a price"],
    },

    quantity: {
      type: Number,
      default: 0,
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A product must have a description"],
    },

    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },

    images: [String],

    description: {
      type: String,
      trim: true,
    },

    ingredients: [String],

    vegetarian: Boolean,

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val) => val.toFixed(1),
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: "Discount price ({VALUE}) should be below regular price",
      },
    },

    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.index({ price: 1, ratingsAverage: -1 });
productSchema.index({ eng: 1 });

// create and save
productSchema.pre("save", function (next) {
  this.slug = slugify(this.name);
  next();
});

productSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id",
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
