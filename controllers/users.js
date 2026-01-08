const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const BadRequestError = require("../errors/BadRequestError");
const NotFoundError = require("../errors/NotFoundError");
const ConflictError = require("../errors/ConflictError");
const UnauthorizedError = require("../errors/UnauthorizedError");

const { CREATED } = require("../utils/errors");
const { JWT_SECRET } = require("../utils/config");

// Create a new user
const createUser = async (req, res, next) => {
  try {
    const { email, password, name, avatar } = req.body;

    if (!email || !password) {
      throw new BadRequestError("Email and password are required");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      avatar,
    });

    const { password: _unused, ...safeUser } = user.toObject();
    console.log(_unused);
    return res.status(CREATED).send(safeUser);
  } catch (err) {
    if (err.code === 11000) {
      return next(new ConflictError("Email already exists"));
    }

    if (err.name === "ValidationError") {
      return next(new BadRequestError("Invalid input data"));
    }

    return next(err);
  }
};

// Get current logged-in user
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).orFail();

    return res.status(200).send(user);
  } catch (err) {
    if (err.name === "DocumentNotFoundError") {
      return next(new NotFoundError("User not found."));
    }

    if (err.name === "CastError") {
      return next(new BadRequestError("Invalid user ID."));
    }

    return next(err);
  }
};

// Login user and return JWT
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.send({ token });
  } catch (err) {
    return next(err);
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
      throw new BadRequestError("No valid fields provided to update");
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new NotFoundError("User not found.");
    }

    return res.status(200).send(user);
  } catch (err) {
    if (err.name === "ValidationError") {
      return next(new BadRequestError("Invalid input data."));
    }

    return next(err);
  }
};

module.exports = {
  createUser,
  getCurrentUser,
  login,
  updateCurrentUser,
};
