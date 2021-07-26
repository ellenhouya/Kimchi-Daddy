const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please tell us your name"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Invalid email"],
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    photo: String,
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minLength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: "passwords are not the same",
      },
    },

    passwordChangedAt: Date,

    passwordResetToken: String,

    passwordResetExpires: Date,

    active: {
      type: Boolean,
      default: true,
      select: false,
    },

    shoppingCart: [
      {
        name: String,
        image: String,
        price: Number,
        quantity: {
          type: Number,
          default: 0,
        },
      },
    ],

    favoriteProducts: {
      type: [mongoose.Schema.ObjectId],
      ref: "Product",
    },
  }
  // {
  //   toJSON: { virtuals: true },
  //   toObject: { virtuals: true },
  // }
);

// encrypt password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;

  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now();

  next();
});

userSchema.pre(/^find/, function (next) {
  this.populate({
    path: "favoriteProducts",
    select: "-quantity -createdAt -images",
  });

  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });

  next();
});

userSchema.methods.correctPassword = async (passwordInput, password_db) =>
  await bcrypt.compare(passwordInput, password_db);

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000);

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
