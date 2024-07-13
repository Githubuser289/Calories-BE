const Userdata = require("../models/userdata");

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
