const app = require('./app');
const mongoose = require('mongoose');
require('dotenv').config();

const { MONGODB_URL, PORT } = process.env;

mongoose
  .connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(`Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  });
