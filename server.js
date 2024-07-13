const app = require("./app");

app.listen(3000, () => {
  console.log("Server is running. Use our API on port: 3000");
  console.log(`Swagger UI available at http://localhost:3000/api-docs`);
});
