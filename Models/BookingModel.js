const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  Booking_Type: {
    type: String,
    required: true,
  },
  Booking_id: {
    type: String,
    required: true,
    unique: true,
  },
  queuingOfficeId: {
    type: String,
    required: true,
  },
  associatedRecords: [
    {
      reference: { type: String, required: true },
      creationDate: { type: Date, required: true },
      originSystemCode: { type: String, required: true },
      flightOfferId: { type: String, required: true },
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
});

const bookingModel = mongoose.model("bookings", bookingSchema);

module.exports = bookingModel;
