const express = require("express");
const router = express.Router();

const productsServices = require("../../controller/productsController");
const { STATUS_CODES } = require("../../utils/statusCodes.js");

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Search products based on a query string.
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 example: powder
 *     responses:
 *       200:
 *         description: List with corresponding products.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Egg powder", "Cocoa powder"]
 *       400:
 *         description: Bad request, validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "query string is required"
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
