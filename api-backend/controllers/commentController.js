const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get all comments
const getAllComments = async (req, res) => {
	try {
		const comments = await prisma.comment.findMany({
			orderBy: { createdAt: "desc" },
			include: {
				author: {
					select: {
						username: true,
						email: true,
					},
				},
			},
		});
		res.json(comments);
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch all comments" });
	}
};

// Get all comments for a specific post
const getCommentsForPost = async (req, res) => {
	const { postId } = req.params;

	try {
		const comments = await prisma.comment.findMany({
			where: { postId: parseInt(postId) },
			orderBy: { createdAt: "desc"},
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

		// Only allow deletion if the username/email match
		if (comment.email !== user.email) {
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

module.exports = { 
	getAllComments,
	getCommentsForPost, 
	createComment, 
	updateComment, 
	deleteComment 
};
