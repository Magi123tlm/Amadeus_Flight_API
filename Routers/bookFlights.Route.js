const express = require("express");
const router = express.Router();
const {
  bookFlight,
  getBookings,
} = require("../Controllers/book-flight.Controller.js");
const { authenticateJWT } = require("../Middleware/authMiddleware.js");

router.post("/book-flight", authenticateJWT, bookFlight);
router.get("/bookings", authenticateJWT, getBookings);

module.exports = router;
