const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("uncaught exception");
  process.exit(1);
});

const app = require("./app");

// process.env.DATABASE_APP
// 'mongodb://127.0.0.1:27017/kimchiDaddy'

mongoose
  .connect(process.env.DATABASE_APP, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("DB connection successful!"));

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("unhandled rejection");

  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    console.log("Process terminated!");
  });
});
