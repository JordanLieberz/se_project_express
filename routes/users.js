const router = require("express").Router();
const {
  createUser,
  login,
  getCurrentUser,
  updateCurrentUser,
} = require("../controllers/users");

const {
  validateUserBody,
  validateLoginBody,
} = require("../middlewares/validation");

router.post("/signup", validateUserBody, createUser);

router.post("/login", validateLoginBody, login);

router.get("/me", getCurrentUser);

router.patch("/me", validateUserBody, updateCurrentUser);

module.exports = router;
