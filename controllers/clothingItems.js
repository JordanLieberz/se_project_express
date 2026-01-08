const ClothingItem = require("../models/clothingItem");

const BadRequestError = require("../errors/BadRequestError");
const NotFoundError = require("../errors/NotFoundError");
const ForbiddenError = require("../errors/ForbiddenError");

// GET /items
const getItems = async (req, res, next) => {
  try {
    const items = await ClothingItem.find({});
    return res.status(200).send(items);
  } catch (err) {
    return next(err);
  }
};

// POST /items
const createItem = async (req, res, next) => {
  try {
    const { name, weather, imageUrl } = req.body;

    const item = await ClothingItem.create({
      name,
      weather,
      imageUrl,
      owner: req.user._id,
    });

    return res.status(201).send(item);
  } catch (err) {
    if (err.name === "ValidationError") {
      return next(new BadRequestError(err.message));
    }
    return next(err);
  }
};

// DELETE /items/:itemId
const deleteItem = async (req, res, next) => {
  try {
    const item = await ClothingItem.findById(req.params.itemId).orFail();

    if (item.owner.toString() !== req.user._id.toString()) {
      throw new ForbiddenError("You cannot delete someone else's item");
    }

    await item.deleteOne();
    return res.status(200).send({ message: "Item deleted successfully." });
  } catch (err) {
    if (err.name === "DocumentNotFoundError") {
      return next(new NotFoundError("Item not found."));
    }
    if (err.name === "CastError") {
      return next(new BadRequestError("Invalid item ID."));
    }
    return next(err);
  }
};

// PUT /items/:itemId/likes
const likeItem = async (req, res, next) => {
  try {
    const item = await ClothingItem.findByIdAndUpdate(
      req.params.itemId,
      { $addToSet: { likes: req.user._id } },
      { new: true }
    );

    if (!item) {
      throw new NotFoundError("Item not found.");
    }

    return res.status(200).send(item);
  } catch (err) {
    if (err.name === "CastError") {
      return next(new BadRequestError("Invalid item ID."));
    }
    return next(err);
  }
};

// DELETE /items/:itemId/likes
const dislikeItem = async (req, res, next) => {
  try {
    const item = await ClothingItem.findByIdAndUpdate(
      req.params.itemId,
      { $pull: { likes: req.user._id } },
      { new: true }
    );

    if (!item) {
      throw new NotFoundError("Item not found.");
    }

    return res.status(200).send(item);
  } catch (err) {
    if (err.name === "CastError") {
      return next(new BadRequestError("Invalid item ID."));
    }
    return next(err);
  }
};

module.exports = {
  getItems,
  createItem,
  deleteItem,
  likeItem,
  dislikeItem,
};
