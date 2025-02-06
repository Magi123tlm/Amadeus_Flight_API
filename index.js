const express = require("express");
const app = express();
const dotenv = require("dotenv");
const { URLSearchParams } = require("url");
const mongooseConnect = require("./DB");
const authRoute = require("./Routers/auth.Route.js");
const searchFlightRoute = require("./Routers/searchFlights.Route.js");
const bookFlightRoute = require("./Routers/bookFlights.Route.js");

dotenv.config();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api/", authRoute);
app.use("/api/", searchFlightRoute);
app.use("/api/", bookFlightRoute);

app.listen(process.env.PORT, () => {
  console.log("Server Started at ", process.env.PORT);
  mongooseConnect();
});
