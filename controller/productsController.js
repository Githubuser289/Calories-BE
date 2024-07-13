const Product = require("../models/products");

const getProductsList = async () => {
  try {
    return Product.find();
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  getProductsList,
};
