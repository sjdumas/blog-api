const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const verifyToken = require("../middleware/authMiddleware");

// Public route
router.get("/", commentController.getAllComments);
router.get("/:postId", commentController.getCommentsForPost);

// Protected routes
router.post("/", verifyToken, commentController.createComment);
router.put("/:id", verifyToken, commentController.updateComment);
router.delete("/:id", verifyToken, commentController.deleteComment);

module.exports = router;
