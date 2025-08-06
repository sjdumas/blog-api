const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const verifyToken = require("../middleware/authMiddleware");

// Public routes
router.get("/", postController.getAllPosts);
router.get("/id/:id", postController.getPostById);
router.get("/:slug", postController.getPostBySlug);

// Protected routes
router.post("/", verifyToken, postController.createPost);
router.put("/:id", verifyToken, postController.updatePost);
router.delete("/:id", verifyToken, postController.deletePost);
router.patch("/:id/publish", verifyToken, postController.togglePublish);

module.exports = router;
