const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const productSchema = new Schema({
  name: {
    type: String,
  },
  amount: {
    type: Number,
  },
});
const consumedProduct = new Schema({
  date: {
    type: String,
  },
  products: [productSchema],
});

const schema = new Schema({
  userid: {
    type: String,
  },
  height: {
    type: Number,
  },
  age: {
    type: Number,
  },
  currentWeight: {
    type: Number,
  },
  desiredWeight: {
    type: Number,
  },
  bloodType: {
    type: Number,
  },
  dailyrate: {
    type: Number,
  },
  consumedproducts: [consumedProduct],
});

const Userdata = model("Userdata", schema);

module.exports = Userdata;
