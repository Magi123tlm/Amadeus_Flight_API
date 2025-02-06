const bookingModel = require("../Models/BookingModel.js");
const userModel = require("../Models/UserModel.js");

const getBookings = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (!user) {
      res.status(400).json({ success: false, message: "User Does Not Exist" });
    }

    if (!user.flight_Bookings) {
      res.status(400).json({
        success: false,
        message: "Flight Bookings Does Not Exist For this user",
      });
    }

    const BookingsData = User.find({ flight_Bookings });
    console.log(BookingsData);
    res.status(400).json({ success: true, BookingsData });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Bookings Fetch Failed" });
  }
};

module.exports = { getBookings };
