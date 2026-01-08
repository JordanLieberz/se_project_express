const router = require("express").Router();
const {
  createUser,
  login,
  getCurrentUser,
  updateCurrentUser,
} = require("../controllers/users");

const {
  validateUser,
  validateUserBody,
  validateLoginBody,
} = require("../middlewares/validation");

router.post("/signup", validateUserBody, createUser);

router.post("/login", validateLoginBody, login);

router.get("/me", getCurrentUser);

router.patch("/me", validateUser, updateCurrentUser);

module.exports = router;
