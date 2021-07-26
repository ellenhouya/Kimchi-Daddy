const express = require("express");
const path = require("path");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const productRouter = require("./routes/productRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const viewRouter = require("./routes/viewRoutes");
const bookingRouter = require("./routes/bookingRoutes");
const { webhookCheckout } = require("./controllers/bookingController");

const app = express();

app.enable("trust proxy");

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(cors());

app.options("*", cors());

// ex: http://localhost:3000/img/products/pro22.jpeg
app.use(express.static(path.join(__dirname, "public")));

app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP. Please try again in an hour.",
});
app.use("/api", limiter);

app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  webhookCheckout
);

app.use(express.json({ limit: "10kb" }));

app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(cookieParser());

app.use(mongoSanitize());

app.use(xss());

// sort=price,ratingsAverage&fields=price,name&price=35
app.use(
  hpp({
    whitelist: [
      "name",
      "engName",
      "price",
      "vegetarian",
      "ratingsAverage",
      "ratingsQuantity",
    ],
  })
);

app.use(compression());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

app.use("/", viewRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRouter);
// app.use("/api/v1/shoppingCart", shoppingCartRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Unable to find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
