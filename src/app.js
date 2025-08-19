const express = require("express");
const mongoose = require("mongoose");
const User = require("./model/Register");
const app = express();
const path = require("path");

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files path
const staticPath = path.join(__dirname, "../public");
app.use(express.static(staticPath));

// MongoDB Connection (Local)
mongoose
  .connect("mongodb://127.0.0.1:27017/alumnet")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Serve Home Page
app.get("/", (req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

// Register Route
app.post("/register", async (req, res) => {
    const {
      fullName,
      email,
      password,
      confirmPassword,
      userType,
      branch,
      rollNumber,
      passoutYear,
      company,
      skills,
      experience,
      phoneNumber,
      collegeName,
    } = req.body;
  
    // Normalize passoutYear if it's an array
    const normalizedPassoutYear = Array.isArray(passoutYear)
      ? passoutYear.find((year) => year.trim() !== "")
      : passoutYear;
  
    // Normalize phoneNumber and collegeName if they are arrays
    const normalizedPhoneNumber = Array.isArray(phoneNumber)
      ? phoneNumber.find((number) => number.trim() !== "")
      : phoneNumber;
  
    const normalizedCollegeName = Array.isArray(collegeName)
      ? collegeName.find((name) => name.trim() !== "")
      : collegeName;
  
    // Validation
    if (!fullName || !email || !password || !confirmPassword || !userType) {
      return res.status(400).json({ message: "All required fields must be filled." });
    }
  
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }
  
    if (userType === "Student" && (!branch || !rollNumber || !normalizedPassoutYear)) {
      return res.status(400).json({ message: "Student-specific fields are required." });
    }
  
    if (
      userType === "Alumni" &&
      (!normalizedPassoutYear || !company || !skills || !experience || !normalizedPhoneNumber || !normalizedCollegeName)
    ) {
      return res.status(400).json({ message: "Alumni-specific fields are required." });
    }
  
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists." });
      }
  
      // Save new user
      const newUser = new User({
        fullName,
        email,
        password,
        userType,
        branch: userType === "Student" ? branch : undefined,
        rollNumber: userType === "Student" ? rollNumber : undefined,
        passoutYear: normalizedPassoutYear,
        company: userType === "Alumni" ? company : undefined,
        skills: userType === "Alumni" ? skills : undefined,
        experience: userType === "Alumni" ? experience : undefined,
        phoneNumber: normalizedPhoneNumber, // Ensure it's a string
        collegeName: normalizedCollegeName, // Ensure it's a string
      });
  
      await newUser.save();
      res.redirect("/"); // Redirect to home page after successful registration
    } catch (err) {
      console.error("Error registering user:", err.message);
      res.status(500).json({ message: "Error saving form data" });
    }
  });
  

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    res.sendFile(path.join(staticPath, "Home.html"));
  } catch (err) {
    console.error("Error logging in user:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
