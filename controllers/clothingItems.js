const ClothingItem = require("../models/clothingItem");
const {
  BAD_REQUEST,
  NOT_FOUND,
  DEFAULT,
  FORBIDDEN,
} = require("../utils/errors");

// GET /items — get all clothing items
const getItems = (req, res, next) => {
  ClothingItem.find({})
    .then((items) => res.status(200).send(items))
    .catch(() =>
      next({
        statusCode: DEFAULT,
        message: "An error has occurred on the server.",
      })
    );
};

// POST /items — create a new clothing item
const createItem = (req, res, next) => {
  const { name, weather, imageUrl } = req.body;

  ClothingItem.create({
    name,
    weather,
    imageUrl,
    owner: req.user._id,
  })
    .then((item) => res.status(201).send(item))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next({
          statusCode: BAD_REQUEST,
          message: err.message,
        });
      }

      return next({
        statusCode: DEFAULT,
        message: "An error has occurred on the server.",
      });
    });
};
const deleteItem = (req, res, next) => {
  const { itemId } = req.params;

  ClothingItem.findById(itemId)
    .orFail()
    .then((item) => {
      if (item.owner.toString() !== req.user._id.toString()) {
        return next({
          statusCode: FORBIDDEN,
          message: "You cannot delete someone else's item",
        });
      }

      return item
        .deleteOne()
        .then(() =>
          res.status(200).send({ message: "Item deleted successfully." })
        );
    })
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return next({
          statusCode: NOT_FOUND,
          message: "Item not found.",
        });
      }

      if (err.name === "CastError") {
        return next({
          statusCode: BAD_REQUEST,
          message: "Invalid item ID.",
        });
      }

      return next({
        statusCode: DEFAULT,
        message: "An error has occurred on the server.",
      });
    });
};
const likeItem = (req, res, next) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .then((item) => {
      if (!item) {
        return next({
          statusCode: NOT_FOUND,
          message: "Item not found.",
        });
      }

      return res.status(200).send(item);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return next({
          statusCode: BAD_REQUEST,
          message: "Invalid item ID.",
        });
      }

      return next({
        statusCode: DEFAULT,
        message: "An error has occurred on the server.",
      });
    });
};
const dislikeItem = (req, res, next) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .then((item) => {
      if (!item) {
        return next({
          statusCode: NOT_FOUND,
          message: "Item not found.",
        });
      }

      return res.status(200).send(item);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return next({
          statusCode: BAD_REQUEST,
          message: "Invalid item ID.",
        });
      }

      return next({
        statusCode: DEFAULT,
        message: "An error has occurred on the server.",
      });
    });
};

module.exports = {
  getItems,
  createItem,
  deleteItem,
  likeItem,
  dislikeItem,
};
