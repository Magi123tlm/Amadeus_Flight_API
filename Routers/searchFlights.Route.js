const express = require("express");
const router = express.Router();
const {
  searchFlights,
} = require("../Controllers/search-flights.Controller.js");
const { authenticateJWT } = require("../Middleware/authMiddleware.js");

router.post("/search-flights", authenticateJWT, searchFlights);

module.exports = router;
