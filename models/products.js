const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const schema = new Schema({
  categories: {
    type: String,
  },
  weight: {
    type: Number,
  },
  title: {
    type: String,
  },
  calories: {
    type: Number,
  },
  groupBloodNotAllowed: {
    type: Array,
  },
});

const Products = model("Products", schema);

module.exports = Products;
