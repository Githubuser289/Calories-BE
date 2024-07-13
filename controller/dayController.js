const Userdata = require("../models/userdata");

// TO DO:
// getUserData
const getUserData = async (field) => {
  try {
    return Userdata.find(field);
  } catch (error) {
    console.error(error);
  }
};
// updateUserData
const probaCitire = async () => {
  try {
    return Userdata.find();
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  getUserData,
};
