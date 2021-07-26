const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const Product = require("../../models/productModel");

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

const products = JSON.parse(
  fs.readFileSync(`${__dirname}/products.json`, "utf-8")
);

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Product.create(products);
    console.log("Data successfully loaded!");
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    await Product.deleteMany();
    console.log("Data successfully deleted!");
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
