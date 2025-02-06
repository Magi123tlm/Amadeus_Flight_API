const { URLSearchParams } = require("url");

const searchFlights = async (req, res) => {
  const { departure, destination, date, travelers } = req.body;
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
    const data = await response1.json();
    // console.log(data);
    const token = data.access_token;
    const response2 = await fetch(
      "https://test.api.amadeus.com/v2/shopping/flight-offers",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currencyCode: "USD",
          originDestinations: [
            {
              id: "1",
              originLocationCode: departure,
              destinationLocationCode: destination,
              departureDateTimeRange: {
                date: date,
                time: "10:00:00",
              },
            },
          ],
          travelers: [travelers],
          sources: ["GDS"],
          searchCriteria: {
            maxFlightOffers: 2,
            flightFilters: {
              cabinRestrictions: [
                {
                  cabin: "BUSINESS",
                  coverage: "MOST_SEGMENTS",
                  originDestinationIds: ["1"],
                },
              ],
            },
          },
        }),
      }
    );
    if (!response2.ok) {
      throw new Error("Failed to retrieve Flight Data");
    }
    const flightSearchData = await response2.json();
    // console.log(flightSearchData);

    res.status(200).json({
      success: "true",
      message: "request successfull",
      data: {
        tokenData: token,
        flightSearchData,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).send("womp womp request failed");
  }
};

module.exports = { searchFlights };
