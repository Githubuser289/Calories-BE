const express = require("express");
const router = express.Router();
require("../../passport.js");
const checkAuth = require("../../middleware/checkAuth.js");
const dayServices = require("../../controller/dayController");
const productsServices = require("../../controller/productsController");
const userData = require("../../models/userdata.js");
const jwt = require("jsonwebtoken");
const calculus = require("../../utils/calculus.js");
const { STATUS_CODES } = require("../../utils/statusCodes.js");

const secret = process.env.TOKEN_SECRET;

const Joi = require("joi");
const personSchema = Joi.object({
  height: Joi.number().required(),
  age: Joi.number().required(),
  currentWeight: Joi.number().required(),
  desiredWeight: Joi.number().required(),
  bloodType: Joi.number().required(),
});

const consumedProductSchema = Joi.object({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  amount: {
    type: Number,
    required: [true, "Amount is required"],
  },
});

const productNameSchema = Joi.object({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
});

const today = new Date();
const day = today.getDate();
const month = today.getMonth() + 1; // Lunile sunt indexate de la 0 în JavaScript
const year = today.getFullYear();
const formattedDay = day < 10 ? "0" + day : day;
const formattedMonth = month < 10 ? "0" + month : month;
const formattedDate = `${formattedMonth}-${formattedDay}-${year}`;

const dateSchema = Joi.date().max(formattedDate);

/* GET localhost:3000/api/day */
router.get("/", checkAuth, async (req, res, next) => {
  try {
    const { error, value } = personSchema.validate(req.body);
    if (error) {
      return res
        .status(STATUS_CODES.badRequest)
        .json({ message: error.details[0].message });
    }

    let { height, age, currentWeight, desiredWeight, bloodType } = value;

    const dailyCalIntake = calculus(value);

    const productsList = await productsServices.getProductsList();
    const notRecomList = productsList
      .filter((item) => item.groupBloodNotAllowed[bloodType] === true)
      .map((item) => item.title);

    const token = req.headers.authorization.split(" ")[1];
    const result = jwt.verify(token, secret);
    const userID = result.data._id;

    let userRecord = await dayServices.getUserData({
      userid: userID,
    });

    if (userRecord.lenght !== 0) {
      await userData.findOneAndUpdate(
        { userid: userID },
        {
          height,
          age,
          currentWeight,
          desiredWeight,
          bloodType,
          dailyrate: dailyCalIntake,
        }
      );
    } else {
      const newUserRecord = new userData({
        userid: userID,
        height,
        age,
        currentWeight,
        desiredWeight,
        bloodType,
        dailyrate: dailyCalIntake,
      });

      await userData.create(newUserRecord);
    }

    res
      .status(STATUS_CODES.success)
      .json({ dailyCalIntake, foodNotRcmnded: notRecomList });
  } catch (error) {
    res
      .status(STATUS_CODES.error)
      .json({ message: `Server error: ${error.message}` });
  }
});

/* GET localhost:3000/api/day/:date */
router.get("/:date", checkAuth, async (req, res, next) => {
  const { error, value } = dateSchema.validate(req.params.date);

  if (error) {
    return res
      .status(STATUS_CODES.badRequest)
      .json({ message: error.details[0].message });
  }
  try {
    const givenDate = req.params.date;
    const token = req.headers.authorization.split(" ")[1];
    const result = jwt.verify(token, secret);
    const userID = result.data._id;

    let userRecord = await dayServices.getUserData({
      userid: userID,
    });
    let resultList = [];
    let foundEntry;
    if (userRecord.length > 0) {
      foundEntry = userRecord[0].consumedproducts.find(
        (entry) => entry.date === givenDate
      );
    } else {
      foundEntry = false;
    }

    if (foundEntry) {
      const products = foundEntry.products;
      products.forEach((product) => {
        resultList.push({ name: product.name, amount: product.amount });
      });
      res.status(STATUS_CODES.success).json({
        data: resultList,
      });
    } else {
      res.status(STATUS_CODES.notFound).json({
        message: "There are no records for given date.",
      });
    }
  } catch (error) {
    respondWithError(res, error);
  }
});

/* POST localhost:3000/api/day/:date */
router.post("/:date", async (req, res, next) => {
  const { error, value } = dateSchema.validate(req.params.date);
  if (error) {
    return res
      .status(STATUS_CODES.badRequest)
      .json({ message: error.details[0].message });
  }
  const { error2, value2 } = consumedProductSchema.validate(req.body);
  if (error2) {
    return res
      .status(STATUS_CODES.badRequest)
      .json({ message: error.details[0].message });
  }

  try {
    const token = req.headers.authorization.split(" ")[1];
    const result = jwt.verify(token, secret);
    const userID = result.data._id;
    let userRecord = await dayServices.getUserData({
      userid: userID,
    });

    const givenDate = req.params.date;
    const product2add = req.body;

    let foundEntry;
    if (userRecord[0].consumedproducts.length === 0) {
      foundEntry = false;
    } else {
      foundEntry = userRecord[0].consumedproducts.find(
        (entry) => entry.date === givenDate
      );
    }
    if (foundEntry) {
      foundEntry.products.push(product2add);
      await userData.findOneAndUpdate(
        { userid: userID },
        {
          consumedproducts: userRecord[0].consumedproducts,
        }
      );
    } else {
      await userData.findOneAndUpdate(
        { userid: userID },
        {
          consumedproducts: [{ date: givenDate, products: [product2add] }],
        }
      );
    }

    res.status(STATUS_CODES.created).json({
      message: `The products has been successfully added.`,
      data: product2add,
    });
  } catch (error) {
    respondWithError(res, error);
  }
});

/* DELETE localhost:3000/api/day/:date */
router.delete("/:date", checkAuth, async (req, res, next) => {
  const { error, value } = dateSchema.validate(req.params.date);
  if (error) {
    return res
      .status(STATUS_CODES.badRequest)
      .json({ message: error.details[0].message });
  }
  const { error2, value2 } = productNameSchema.validate(req.body);
  if (error2) {
    return res
      .status(STATUS_CODES.badRequest)
      .json({ message: error.details[0].message });
  }

  try {
    const token = req.headers.authorization.split(" ")[1];
    const result = jwt.verify(token, secret);
    const userID = result.data._id;
    console.log("userID=", userID);
    let userRecord = await dayServices.getUserData({
      userid: userID,
    });
    let workArray;

    const givenDate = req.params.date;
    const product2delete = req.body;
    // console.log(userID);
    // console.log(givenDate);
    // console.log(product2delete);
    let foundEntry;
    let flag = false;
    if (userRecord[0].consumedproducts.length === 0) {
      foundEntry = false;
    } else {
      foundEntry = userRecord[0].consumedproducts.find(
        (entry) => entry.date === givenDate
      );
    }
    console.log("foundEntry ", foundEntry);
    if (foundEntry) {
      workArray = userRecord[0].consumedproducts;
      console.log(workArray);
      console.log("exista inregistrare PT ZIUA RESPECTIVA");
      const productIndex = foundEntry.products.findIndex(
        (product) => product.name === product2delete.name
      );
      console.log("productIndex=", productIndex);
      if (productIndex !== -1) {
        foundEntry.products.splice(productIndex, 1);
        console.log("products=", foundEntry.products);
        console.log("workArray ", workArray);

        // aici ar tb sa tin cont daca lista ramane goala
        // si sa sterg toata inregistrarea coresp. givenDate
        // ****************
        // ****************
        // aici am de facut UPDATE
        await userData.findOneAndUpdate(
          { userid: userID },
          {
            consumedproducts: workArray,
          }
        );
        flag = true;
      }
    }
    if (flag) {
      res.status(STATUS_CODES.created).json({
        message: `DEPANARE *** The product has been successfully deleted`,
        data: product2delete,
      });
    } else {
      res.status(STATUS_CODES.badRequest).json({
        message: `There are no records for the given date`,
      });
    }
  } catch (error) {
    respondWithError(res, error);
  }
});

/**
 * Handles Error Cases
 */
function respondWithError(res, error) {
  console.error(error);
  res.status(STATUS_CODES.error).json({ message: `${error}` });
}

module.exports = router;
