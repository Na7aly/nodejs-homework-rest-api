const app = require("./app");
const mongoose = require("mongoose");
require("dotenv").config();

const { MONGODB_URL, PORT } = process.env;

mongoose
  .connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Database connection successful"))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });

app.listen(PORT, () => {
  console.log(`Server is running. Use our API on port: ${PORT}`);
});
