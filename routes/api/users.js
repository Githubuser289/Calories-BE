/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and login
 */

/**
 * @swagger
 * tags:
 *   - name: Login
 *     description: Login
 *   - name: Accounts
 *     description: Accounts
 */
/**
 * @swagger
 * /users/signup:
 *   post:
 *     summary: user signup route--summary
 *     description: Needs name, email, and password--description
 *     responses:
 *       201:
 *         description: Created -user account was successfully created
 *       400:
 *         description: Bad request -given data are not correct or in the right format
 *       409:
 *         description: Conflict -email in use
 *       500:
 *         description: Server error
 */
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

require("../../passport.js");

const User = require("../../models/user");
const checkAuth = require("../../middleware/checkAuth.js");
const AuthController = require("../../controller/authController.js");
const { STATUS_CODES } = require("../../utils/statusCodes.js");

const Joi = require("joi");
const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

/* POST localhost:3000/api/users/signup */
router.post("/signup", async (req, res) => {
  try {
    const { error, value } = userSchema.validate(req.body);
    if (error) {
      return res
        .status(STATUS_CODES.badRequest)
        .json({ message: error.details[0].message });
    }

    const { name, email, password } = value;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(STATUS_CODES.conflict)
        .json({ message: "Email in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(STATUS_CODES.created).json({
      user: {
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    res
      .status(STATUS_CODES.error)
      .json({ message: `Server error: ${error.message}` });
  }
});

/* POST localhost:3000/api/users/login */
router.post("/login", async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res
        .status(STATUS_CODES.badRequest)
        .json({ message: error.details[0].message });
    }

    const { email, password } = value;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(STATUS_CODES.unauthorized).json({
        message: "Email or password is wrong",
      });
    }

    const token = await AuthController.login({ email, password });

    res.status(STATUS_CODES.success).json({
      token: token,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res
      .status(STATUS_CODES.error)
      .json({ message: `Server error: ${error.message}` });
  }
});

/* GET localhost:3000/api/users/logout */
router.get("/logout", checkAuth, async (req, res, next) => {
  try {
    const header = req.get("authorization");
    if (!header) {
      return res
        .status(STATUS_CODES.unauthorized)
        .json({ message: "Authentication is required for this route" });
    }

    const token = header.split(" ")[1];
    const payload = AuthController.getPayloadFromJWT(token);

    const filter = { _id: payload.data._id };

    const user = await User.findOne(filter);
    if (!user) {
      return res
        .status(STATUS_CODES.unauthorized)
        .json({ message: "Not authorized" });
    }

    await User.findOneAndUpdate(filter, { token: null });

    res.status(STATUS_CODES.noContent).send();
  } catch (error) {
    respondWithError(res, error, STATUS_CODES.error);
  }
});

/* GET localhost:3000/api/users/current */
router.get("/current", checkAuth, async (req, res, next) => {
  try {
    const header = req.get("authorization");
    if (!header) {
      return res
        .status(STATUS_CODES.unauthorized)
        .json({ message: "Authentication is required for this route" });
    }

    const token = header.split(" ")[1];
    const payload = AuthController.getPayloadFromJWT(token);

    const filter = { _id: payload.data._id };

    const user = await User.findOne(filter);
    if (!user) {
      return res
        .status(STATUS_CODES.unauthorized)
        .json({ message: "Not authorized" });
    }

    res.status(STATUS_CODES.success).json({
      email: user.email,
      subscription: user.subscription,
    });
  } catch (error) {
    respondWithError(res, error, STATUS_CODES.error);
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
