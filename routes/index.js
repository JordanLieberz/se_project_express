const router = require("express").Router();
const { login, createUser } = require("../controllers/users");
const auth = require("../middlewares/auth");
const { NOT_FOUND } = require("../utils/errors");

const userRouter = require("./users");
const clothingItem = require("./clothingItems");

router.post("/signin", login);
router.post("/signup", createUser);
router.use("/items", clothingItem);

router.use(auth);

router.use("/users", userRouter);

router.use((req, res) => {
  res.status(NOT_FOUND).send({ message: "Router not found" });
});

module.exports = router;
