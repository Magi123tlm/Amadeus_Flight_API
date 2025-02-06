const mongoose = require("mongoose");

const mongooseConnect = async () => {
  try {
    await mongoose.connect(process.env.URI);
    console.log("MongoDB Connected.....");
  } catch (error) {
    console.log(error);
  }
};

module.exports = mongooseConnect;
