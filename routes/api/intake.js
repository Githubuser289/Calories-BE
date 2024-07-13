const express = require("express");
const router = express.Router();
const productsServices = require("../../controller/productsController");
const calculus = require("../../utils/calculus.js");
const { STATUS_CODES } = require("../../utils/statusCodes.js");

const Joi = require("joi");
const intakeSchema = Joi.object({
  height: Joi.number().required(),
  age: Joi.number().required(),
  currentWeight: Joi.number().required(),
  desiredWeight: Joi.number().required(),
  bloodType: Joi.number().required(),
});

/* GET localhost:3000/api/intake */
router.get("/", async (req, res) => {
  // console.log(req.body);
  try {
    const { error, value } = intakeSchema.validate(req.body);
    if (error) {
      return res
        .status(STATUS_CODES.badRequest)
        .json({ message: error.details[0].message });
    }

    const { height, age, currentWeight, desiredWeight, bloodType } = value;

    const dailyCalIntake = calculus(value);

    const productsList = await productsServices.getProductsList();
    const notRecomList = productsList
      .filter((item) => item.groupBloodNotAllowed[bloodType] === true)
      .map((item) => item.title);

    res
      .status(STATUS_CODES.success)
      .json({ dailyCalIntake, foodNotRcmnded: notRecomList });
  } catch (error) {
    res
      .status(STATUS_CODES.error)
      .json({ message: `Server error: ${error.message}` });
  }
});

/**
 * Handles Error Cases
 */
function respondWithError(res, error, statusCode) {
  console.error(error);
  res.status(statusCode).json({ message: `${error}` });
}

module.exports = router;
