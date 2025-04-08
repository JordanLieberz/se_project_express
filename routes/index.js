const router = require("express").Router();
const { NOT_FOUND } = require("../utils/errors");

const userRouter = require("./users");
const clothingItem = require("./clothingItems");

router.use("/users", userRouter);
router.use("/items", clothingItem);

router.use((req, res) => {
  res.status(NOT_FOUND).send({ message: "Router not found" });
});

module.exports = router;
