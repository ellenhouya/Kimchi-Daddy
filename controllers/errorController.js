const AppError = require("../utils/appError");

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    res
      .status(err.statusCode)
      .set("Content-Security-Policy", "img-src 'self' data:")
      .render("error", {
        title: "Something went wrong",
        msg: err.message,
      });
  }
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      // programming errors
      console.error("Error", err);

      res.status(500).json({
        status: "error",
        message: "Something went wrong...",
      });
    }
  } else {
    // Rendered website
    if (err.isOperational) {
      res
        .status(err.statusCode)
        .set("Content-Security-Policy", "img-src 'self' data:")
        .render("error", {
          title: "Something went wrong",
          msg: err.message,
        });
    } else {
      // programming errors
      console.error("Error", err);

      res
        .status(500)
        .set("Content-Security-Policy", "img-src 'self' data:")
        .render("error", {
          title: "Something went wrong",
          msg: "請稍後再次嘗試",
        });
    }
  }
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = Object.values(err.keyValue)[0];
  const message = `Duplicate field value: ${value}`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const message = Object.values(err.errors)
    .map((valueObj) => valueObj.message)
    .join(". ");

  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again.", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired. Please log in again.", 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  }

  if (process.env.NODE_ENV === "production") {
    let error = Object.assign(err);

    if (error.name === "CastError") error = handleCastErrorDB(error);

    if (error.code === 11000) error = handleDuplicateFieldsDB(error);

    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);

    if (error.name === "JsonWebTokenError") error = handleJWTError();

    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
