const express = require("express");
const bcrypt = require("bcrypt");
const collection = require("./config");

const app = express();

// Convert data into JSON format
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Use EJS as the view engine
app.set('view engine', 'ejs');

// Use static files
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

// Register user
app.post("/signup", async (req, res) => {
  const data = {
    name: req.body.username,
    password: req.body.password
  };

  try {
    // Check if the user already exists in the database
    const existingUser = await collection.findOne({ name: data.name });
    if (existingUser) {
      return res.send("User already exists. Please choose a different username.");
    }

    // Hash the password using bcrypt
    const saltRounds = 10; // number of salt rounds for bcrypt
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);
    data.password = hashedPassword; // Replace the plain password with the hashed one

    // Insert user data
    const userdata = await collection.insertOne(data);
    console.log(userdata);
    res.send("User registered successfully.");
  } catch (error) {
    console.error(error);
    res.send("Error registering user.");
  }
});

// User login
app.post("/login", async (req, res) => {
  try {
    const check = await collection.findOne({ name: req.body.username });
    if (!check) {
      return res.send("Username not found.");
    }

    // Compare the hashed password from the database with the plain text password
    const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
    if (isPasswordMatch) {
      // If needed, update the password and other details after a successful login.
      const updateData = {};

      // If you need to update the password (e.g., user changed it)
      if (req.body.password !== check.password) {
        const saltRounds = 10; // Define salt rounds again for security
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        updateData.password = hashedPassword; // Hash and update the password
      }

      // Update lastLogin field
      updateData.lastLogin = new Date(); // Store current date and time as lastLogin

      // Update the user document with the new data (password and lastLogin)
      const updateResult = await collection.updateOne(
        { name: req.body.username }, // Find the user by username
        { $set: updateData } // Update the user document with new data
      );

      if (updateResult.modifiedCount > 0) {
        console.log("User details updated.");
      }

      res.render("home"); // Redirect or render home page
    } else {
      res.send("Wrong password.");
    }
  } catch (error) {
    console.error(error);
    res.send("Error logging in.");
  }
});

// API to show user details from the database
app.get("/users", async (req, res) => {
  try {
    const users = await collection.find({}).toArray(); // Fetch all users
    res.json(users); // Send users as JSON response
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving users.");
  }
});

const port = 8086;
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
