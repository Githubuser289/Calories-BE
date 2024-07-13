const express = require("express");
const router = express.Router();

const productsServices = require("../../controller/productsController");
const { STATUS_CODES } = require("../../utils/statusCodes.js");

/* GET localhost:3000/api/products */
router.get("/", async (req, res, next) => {
  try {
    const productsList = await productsServices.getProductsList();
    res.status(STATUS_CODES.success).json({
      data: productsList,
    });
  } catch (error) {
    respondWithError(res, error);
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
