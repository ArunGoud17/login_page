const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/login_tut")
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });

// Define the schema
const LoginSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Make username unique
    index: true,  // Index for performance
  },
  password: {
    type: String,
    required: true,
  },
});

// Create the model using the schema
const collection = mongoose.model("users", LoginSchema);

// Export the model
module.exports = collection;
