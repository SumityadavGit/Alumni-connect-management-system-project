const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    enum: ["Student", "Alumni"],
    required: true,
  },
  branch: {
    type: String,
    required: function () {
      return this.userType === "Student";
    },
  },
  rollNumber: {
    type: String,
    required: function () {
      return this.userType === "Student";
    },
  },
  passoutYear: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: function () {
      return this.userType === "Alumni";
    },
  },
  skills: {
    type: String,
    required: function () {
      return this.userType === "Alumni";
    },
  },
  experience: {
    type: String,
    required: function () {
      return this.userType === "Alumni";
    },
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  collegeName: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
