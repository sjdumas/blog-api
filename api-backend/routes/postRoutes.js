const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const verifyToken = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");

// --- Author OR Admin guard for routes with :id ---
const authorOrAdmin = async (req, res, next) => {
	try {
		const id = parseInt(req.params.id, 10);
		const post = await prisma.post.findUnique({
			where: { id },
			select: { authorId: true }
		});
		if (!post) return res.status(404).json({ error: "Post not found" });

		const isOwner = req.user?.userId === post.authorId;
		const isAdmin = !!req.user?.isAdmin;
		if (!isOwner && !isAdmin) {
			return res.status(403).json({ error: "Not authorized" });
		}
		next();
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Authorization check failed" });
	}
};

// --- Validation helpers ---
const postValidators = [
	body("title").trim().isLength({ min: 1, max: 160 }).withMessage("Title is required (1–160 chars)"),
	body("content").trim().isLength({ min: 1 }).withMessage("Content is required"),
	body("slug")
		.trim()
		.matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage("Slug must be kebab-case")
		.isLength({ min: 3, max: 120 }).withMessage("Slug must be 3–120 chars"),
	body("excerpt").optional().isLength({ max: 300 }).withMessage("Excerpt max length is 300"),
];

function validate(req, res, next) {
	const result = validationResult(req);
	if (!result.isEmpty()) {
		return res.status(400).json({ error: "Validation failed", details: result.array() });
	}
	next();
}

const mutateLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 30,
	standardHeaders: true,
	legacyHeaders: false,
});

// ------------------------- PROTECTED ROUTES -------------------------

// Get a post by numeric ID
router.get("/id/:id", verifyToken, authorOrAdmin, postController.getPostById);

// Admin-only management list (includes drafts & published)
router.get("/manage", verifyToken, adminOnly, postController.getManagePosts);

// Admin-only: GET /api/posts/stats → { total, draft, published }
router.get("/stats", verifyToken, adminOnly, async (req, res) => {
	try {
		const total = await prisma.post.count();
		const draft = await prisma.post.count({ where: { status: "DRAFT" } });
		const published = await prisma.post.count({ where: { status: "PUBLISHED" } });

		res.json({ total, draft, published });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Failed to fetch post stats" });
	}
});

// -------------------------- PUBLIC ROUTES ---------------------------
router.get("/", postController.getAllPosts);
router.get("/public", postController.getPublicPosts);

// Slug route must come AFTER /id, /manage, /stats
router.get("/:slug", postController.getPostBySlug);

// --------------------------- MUTATIONS ------------------------------
router.post("/", verifyToken, postValidators, validate, mutateLimiter, postController.createPost);
// FIX: Define more specific routes BEFORE generic ones
router.put("/:id/publish", verifyToken, adminOnly, mutateLimiter, postController.publishPost);
router.put("/:id/unpublish", verifyToken, adminOnly, mutateLimiter, postController.unpublishPost);

// Generic /:id route now comes after specific ones
router.put("/:id", verifyToken, authorOrAdmin, postValidators, validate, mutateLimiter, postController.updatePost);

router.delete("/:id", verifyToken, authorOrAdmin, mutateLimiter, postController.deletePost);

module.exports = router;
