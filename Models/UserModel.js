const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
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
  flight_Bookings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "bookings",
    },
  ],
});

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
