const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const dayRouter = require("./routes/api/day");
const intakeRouter = require("./routes/api/intake");
const productsRouter = require("./routes/api/products");
const usersRouter = require("./routes/api/users");
const connectToDb = require("./utils/connectToDb");

const app = express();
const formatsLogger = app.get("env") === "development" ? "dev" : "short";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
    },
  },
  apis: ["./routes/api/*.js"], // Fiișerul (fișierele) în care sunt comentariile JSDoc
};

const swaggerSpec = swaggerJsdoc(options);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

connectToDb();

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use("/api/day", dayRouter);
app.use("/api/intake", intakeRouter);
app.use("/api/products", productsRouter);
app.use("/api/users", usersRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found!" });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

module.exports = app;
