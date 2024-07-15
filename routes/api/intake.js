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

/**
 * @swagger
 * /api/intake:
 *   post:
 *     summary: Calculate daily calorie intake and get non-recommended foods.
 *     tags:
 *       - Intake
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               height:
 *                 type: number
 *                 example: 170
 *               age:
 *                 type: number
 *                 example: 25
 *               currentWeight:
 *                 type: number
 *                 example: 70
 *               desiredWeight:
 *                 type: number
 *                 example: 65
 *               bloodType:
 *                 type: number
 *                 example: 1
 *             required:
 *               - height
 *               - age
 *               - currentWeight
 *               - desiredWeight
 *               - bloodType
 *     responses:
 *       200:
 *         description: Daily calorie intake and non-recommended foods.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dailyCalIntake:
 *                   type: number
 *                   example: 1800
 *                 foodNotRcmnded:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["bread", "sugar", "pasta"]
 *       400:
 *         description: Bad request, validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "height is required"
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error: Internal Server Error"
 */

/* POST localhost:3000/api/intake */
router.post("/", async (req, res) => {
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
