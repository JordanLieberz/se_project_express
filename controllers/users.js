const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const {
  BAD_REQUEST,
  NOT_FOUND,
  DEFAULT,
  CREATED,
  CONFLICT,
  UNAUTHORIZED,
} = require("../utils/errors");
const { JWT_SECRET } = require("../utils/config");

// Create a new user
const createUser = async (req, res, next) => {
  try {
    const { email, password, name, avatar } = req.body;

    if (!email || !password) {
      return next({
        statusCode: BAD_REQUEST,
        message: "Email and password are required",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      avatar,
    });

    const { password: _unused, ...safeUser } = user.toObject(); // omit password
    console.log(_unused);

    return res.status(CREATED).send(safeUser);
  } catch (err) {
    if (err.code === 11000) {
      return next({ statusCode: CONFLICT, message: "Email already exists" });
    }
    if (err.name === "ValidationError") {
      return next({ statusCode: BAD_REQUEST, message: "Invalid input data" });
    }
    return next({
      statusCode: DEFAULT,
      message: "An error has occurred on the server.",
    });
  }
};

// Get current logged-in user
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).orFail();
    return res.status(200).send(user);
  } catch (err) {
    if (err.name === "DocumentNotFoundError") {
      return next({ statusCode: NOT_FOUND, message: "User not found." });
    }
    if (err.name === "CastError") {
      return next({ statusCode: BAD_REQUEST, message: "Invalid user ID." });
    }
    return next({
      statusCode: DEFAULT,
      message: "An error has occurred on the server.",
    });
  }
};

// Login user and return JWT
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next({
        statusCode: UNAUTHORIZED,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next({
        statusCode: UNAUTHORIZED,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    return res.send({ token });
  } catch (err) {
    return next({
      statusCode: UNAUTHORIZED,
      message: "Invalid email or password",
    });
  }
};

// Update current user info
const updateCurrentUser = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const updateFields = {};
    if (name) updateFields.name = name;
    if (avatar) updateFields.avatar = avatar;

    if (Object.keys(updateFields).length === 0) {
      return next({
        statusCode: BAD_REQUEST,
        message: "No valid fields provided to update",
      });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next({ statusCode: NOT_FOUND, message: "User not found." });
    }

    return res.status(200).send(user);
  } catch (err) {
    if (err.name === "ValidationError") {
      return next({ statusCode: BAD_REQUEST, message: "Invalid input data." });
    }
    return next({
      statusCode: DEFAULT,
      message: "An error has occurred on the server.",
    });
  }
};

module.exports = {
  createUser,
  getCurrentUser,
  login,
  updateCurrentUser,
};
