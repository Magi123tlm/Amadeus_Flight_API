const { URLSearchParams } = require("url");
const UserModel = require("../Models/UserModel.js");
const BookingModel = require("../Models/BookingModel.js");

const getBookings = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User Does Not Exist" });
    }

    if (!user.flight_Bookings || user.flight_Bookings.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Flight Bookings Does Not Exist For this user",
      });
    }

    const User_Bookings_Data = await UserModel.findById(req.user._id)
      .populate("flight_Bookings")
      .exec();
    res.status(200).json({ success: true, User_Bookings_Data });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ success: false, message: "Bookings Fetch Failed" });
  }
};

const bookFlight = async (req, res) => {
  const { flight_details, userInfo } = req.body;

  try {
    const response1 = await fetch(
      "https://test.api.amadeus.com/v1/security/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(
          `grant_type=client_credentials&client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}`
        ),
      }
    );
    if (!response1.ok) {
      throw new Error("Failed to retrieve OAuth token");
    }
    const data1 = await response1.json();
    const token = data1.access_token;
    //   console.log(token);

    const response2 = await fetch(
      `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${"NYC"}&destinationLocationCode=${"SAN"}&departureDate=2025-05-02&adults=1&children=0&infants=0&nonStop=false&max=5`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response2.ok) {
      throw new Error("Failed to retrieve Flight Data");
    }
    const flightSearchData = await response2.json();
    // console.log(flightSearchData.data[0]);

    const response3 = await fetch(
      "https://test.api.amadeus.com/v1/shopping/flight-offers/pricing?forceClass=false",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            type: "flight-offers-pricing",
            flightOffers: [flightSearchData.data[0]],
          },
        }),
      }
    );

    if (!response3.ok) {
      throw new Error("Failed to retrieve flight price data");
    }

    const flightPriceData = await response3.json();
    // console.log(flightPriceData);

    const response4 = await fetch(
      "https://test.api.amadeus.com/v1/booking/flight-orders",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            type: "flight-order",
            flightOffers: [flightPriceData.data.flightOffers[0]],
            travelers: [
              {
                id: "1",
                dateOfBirth: "1982-01-16",
                name: {
                  firstName: "JORGE",
                  lastName: "GONZALES",
                },
                gender: "MALE",
                contact: {
                  emailAddress: "jorge.gonzales833@telefonica.es",
                  phones: [
                    {
                      deviceType: "MOBILE",
                      countryCallingCode: "34",
                      number: "480080076",
                    },
                  ],
                },
                documents: [
                  {
                    documentType: "PASSPORT",
                    birthPlace: "Madrid",
                    issuanceLocation: "Madrid",
                    issuanceDate: "2015-04-14",
                    number: "00000000",
                    expiryDate: "2025-04-14",
                    issuanceCountry: "ES",
                    validityCountry: "ES",
                    nationality: "ES",
                    holder: true,
                  },
                ],
              },
            ],
            remarks: {
              general: [
                {
                  subType: "GENERAL_MISCELLANEOUS",
                  text: "ONLINE BOOKING FROM INCREIBLE VIAJES",
                },
              ],
            },
            ticketingAgreement: {
              option: "DELAY_TO_CANCEL",
              delay: "6D",
            },
            contacts: [
              {
                addresseeName: {
                  firstName: "PABLO",
                  lastName: "RODRIGUEZ",
                },
                companyName: "INCREIBLE VIAJES",
                purpose: "STANDARD",
                phones: [
                  {
                    deviceType: "LANDLINE",
                    countryCallingCode: "34",
                    number: "480080071",
                  },
                  {
                    deviceType: "MOBILE",
                    countryCallingCode: "33",
                    number: "480080072",
                  },
                ],
                emailAddress: "support@increibleviajes.es",
                address: {
                  lines: ["Calle Prado, 16"],
                  postalCode: "28014",
                  cityName: "Madrid",
                  countryCode: "ES",
                },
              },
            ],
          },
        }),
      }
    );

    if (!response4.ok) {
      throw new Error("Failed to retrieve booking data");
    }

    const bookingResult = await response4.json();
    // console.log(bookingResult);
    const { type, id, queuingOfficeId } = bookingResult.data;
    // console.log(type, id, queuingOfficeId);
    const bookingData = {
      Booking_Type: type,
      Booking_id: id,
      queuingOfficeId: queuingOfficeId,
      associatedRecords: bookingResult.data.associatedRecords[0],
    };
    // console.log(bookingResult);

    // console.log(req.user);
    const user = await UserModel.findById(req.user._id);
    if (user) {
      const newBooking = new BookingModel({
        Booking_Type: type,
        Booking_id: id,
        queuingOfficeId: queuingOfficeId,
        associatedRecords: [
          {
            reference: bookingResult.data.associatedRecords[0].reference,
            creationDate: bookingResult.data.associatedRecords[0].creationDate,
            originSystemCode:
              bookingResult.data.associatedRecords[0].originSystemCode,
            flightOfferId:
              bookingResult.data.associatedRecords[0].flightOfferId,
          },
        ],
      });
      await newBooking.save();

      user.flight_Bookings.push(newBooking._id);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Flight Booked Successfully",
      Booking_Data: bookingData,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "Flight Booking Failed",
    });
  }
};

module.exports = { bookFlight, getBookings };
