const UserModel = require("../Models/UserModel.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.findOne({ email });
    if (user) {
      res.json({ status: false, message: "User Already Exists" });
    }
    const newUser = new UserModel({
      name,
      email,
      password: hashPassword,
    });
    const savedUser = await newUser.save();
    res.status(201).json({ status: true, message: "User Succesfully Created" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: false, message: "User Registration Failed" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(403)
        .json({ message: "Auth Failed to Login", success: "false" });
    }
    const isPasswordEqual = await bcrypt.compare(password, user.password);
    if (!isPasswordEqual) {
      return res
        .status(403)
        .json({ message: "Auth Failed to Login", success: "false" });
    }
    const jwtToken = jwt.sign(
      { email: user.email, _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "10h" }
    );
    res.status(200).json({
      message: "Login Successfull",
      success: true,
      jwtToken,
      email,
      name: user.name,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "User Login Failed" });
  }
};

module.exports = { register, login };
