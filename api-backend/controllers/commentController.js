const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get paginated comments with optional search & post filter
const getAllComments = async (req, res) => {
	try {
		// Parse & sanitize query params
		const page = Math.max(1, parseInt(req.query.page, 10) || 1);
		const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize, 10) || 10));
		const q = (req.query.q || "").trim();
		const postId = req.query.postId ? parseInt(req.query.postId, 10) : null;

		const where = {
			...(postId ? { postId } : {}),
			...(q
				? {
					OR: [
						{ content: { contains: q, mode: "insensitive" } },
						{ username: { contains: q, mode: "insensitive" } },
						{ email: { contains: q, mode: "insensitive" } },
						{ author: { username: { contains: q, mode: "insensitive" } } },
						{ author: { email: { contains: q, mode: "insensitive" } } },
					],
				}
				: {}),
		};

		// Count + page results (single transaction for consistency)
		const [total, comments] = await prisma.$transaction([
			prisma.comment.count({ where }),
			prisma.comment.findMany({
				where,
				orderBy: { createdAt: "desc" },
				skip: (page - 1) * pageSize,
				take: pageSize,
				include: {
					author: {
						select: { username: true, email: true },
					},
				},
			}),
		]);

		res.json({
			data: comments,
			page,
			pageSize,
			total,
			totalPages: Math.max(1, Math.ceil(total / pageSize)),
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Failed to fetch comments" });
	}
};

// Get all comments for a specific post
const getCommentsForPost = async (req, res) => {
	const { postId } = req.params;

	try {
		const comments = await prisma.comment.findMany({
			where: { postId: parseInt(postId) },
			orderBy: { createdAt: "desc" },
		});
		res.json(comments);
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch comments" });
	}
};

// Create a new comment
const createComment = async (req, res) => {
	const { content, postId } = req.body;
	const userId = req.user.userId;

	const user = await prisma.user.findUnique({
		where: { id: userId },
	});

	try {
		const newComment = await prisma.comment.create({
			data: {
				content,
				username: user.username,
				email: user.email,
				postId,
			},
			include: {
				author: {
					select: { username: true, email: true },
				}
			},
		});
		res.status(201).json(newComment);
	} catch (error) {
		res.status(500).json({ error: "Failed to create comment" });
	}
};

// Edit/update comment
const updateComment = async (req, res) => {
	const { id } = req.params;
	const { content } = req.body;
	const userId = req.user.userId;

	try {
		const comment = await prisma.comment.findUnique({
			where: { id: parseInt(id) },
		});

		if (!comment) {
			return res.status(404).json({ error: "Comment not found" });
		}

		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		// Allow if user is admin OR if they are the original author
		if (!user.isAdmin && comment.email !== user.email) {
			return res
				.status(401)
				.json({ error: "You are not authorized to edit this comment." });
		}

		const updated = await prisma.comment.update({
			where: { id: parseInt(id) },
			data: { content },
			include: {
				author: {
					select: { username: true, email: true }
				}
			},
		});

		res.json(updated);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Failed to update comment" });
	}
};

// Delete comment
const deleteComment = async (req, res) => {
	const { id } = req.params;
	const userId = req.user.userId;

	try {
		const comment = await prisma.comment.findUnique({
			where: { id: parseInt(id) },
		});

		if (!comment) {
			return res.status(404).json({ error: "Comment not found" });
		}

		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		// Allow if user is admin OR if they are the original author
		if (!user.isAdmin && comment.email !== user.email) {
			return res.status(403).json({ error: "You are not authorized to delete this comment." });
		}

		const deleted = await prisma.comment.delete({
			where: { id: parseInt(id) },
		});
		res.json({ message: "Comment deleted" });
	} catch (error) {
		res.status(500).json({ error: "Failed to delete comment" });
	}
};

// Get comments stats for Admin Dashboard
const getCommentStats = async (req, res, next) => {
	try {
		const total = await prisma.comment.count();
		res.json({ total });
	} catch (error) {
		next(error);
	}
};

module.exports = {
	getAllComments,
	getCommentsForPost,
	createComment,
	updateComment,
	deleteComment,
	getCommentStats
};
