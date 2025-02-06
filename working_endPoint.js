app.post("/api", async (req, res) => {
  try {
    const response1 = await fetch(
      "https://test.api.amadeus.com/v1/security/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(
          `grant_type=client_credentials&client_id=WidyPIe0n1gWoF94FuF1fUpRfFqPehkP&client_secret=zMbUATDy4dWKuIqz`
        ),
      }
    );
    if (!response1.ok) {
      throw new Error("Failed to retrieve OAuth token");
    }
    const data = await response1.json();
    console.log(data);
    const token = data.access_token;
    const response2 = await fetch(
      "https://test.api.amadeus.com/v1/shopping/flight-destinations?origin=PAR&maxPrice=200",
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
    const flightDestinations = await response2.json();
    console.log(flightDestinations);

    res.status(200).json({
      success: "true",
      message: "request successfull",
      data: {
        tokenData: token,
        flightDestinations,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).send("womp womp request failed");
  }
});
