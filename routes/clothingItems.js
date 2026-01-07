const router = require("express").Router();
const {
  getItems,
  createItem,
  deleteItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItems");

const auth = require("../middlewares/auth");
const { validateCardBody, validateId } = require("../middlewares/validation");

// Get all items
router.get("/", getItems);

// Create a new item
router.post("/", auth, validateCardBody, createItem);

// Delete an item
router.delete("/:itemId", auth, validateId, deleteItem);

// Like an item
router.put("/:itemId/likes", auth, validateId, likeItem);

// Dislike an item
router.delete("/:itemId/likes", auth, validateId, dislikeItem);

module.exports = router;
