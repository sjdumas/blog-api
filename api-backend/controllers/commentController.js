const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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
	const { content, username, email, postId } = req.body;

	try {
		const newComment = await prisma.comment.create({
			data: {
				content,
				username,
				email,
				postId,
			},
		});
		res.status(201).json(newComment);
	} catch (error) {
		res.status(500).json({ error: "Failed to create comment" });
	}
};

// Edit comment
const updateComment = async (req, res) => {
	const { id } = req.params;
	const { content, username, email } = req.body;

	try {
		const updated = await prisma.comment.update({
			where: { id: parseInt(id) },
			data: { content, username, email },
		});
		res.json(updated);
	} catch (error) {
		res.status(500).json({ error: "Failed to update comment" });
	}
};

// Delete comment
const deleteComment = async (req, res) => {
	const { id } = req.params;

	try {
		const deleted = await prisma.comment.delete({
			where: { id: parseInt(id) },
		});
		res.json({ message: "Comment deleted" });
	} catch (error) {
		res.status(500).json({ error: "Failed to delete comment" });
	}
};

module.exports = { 
	getCommentsForPost, 
	createComment, 
	updateComment, 
	deleteComment 
};
