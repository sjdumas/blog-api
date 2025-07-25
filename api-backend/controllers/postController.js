const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get all published posts
const getAllPosts = async (req, res) => {
	try {
		const posts = await prisma.post.findMany({
			where: { published: true },
			include: { author: true, comments: true },
		});
		res.json(posts);
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch posts" });
	}
};

// Get a single post by ID
const getPostById = async (req, res) => {
	const { id } = req.params;

	try {
		const post = await prisma.post.findUnique({
			where: { id: parseInt(id) },
			include: { author: true, comments: true, },
		});
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}
		res.json(post);
	} catch (error) {
		res.status(500).json({ error: "Error fetching post" });
	}
};

// Create a new post
const createPost = async (req, res) => {
	const { title, content, slug, excerpt, published, authorId } = req.body;

	try {
		const newPost = await prisma.post.create({
			data: {
				title,
				content,
				slug,
				excerpt,
				published,
				authorId,
			},
		});
		res.status(201).json(newPost);
	} catch (error) {
		res.status(500).json({ error: "Failed to create post" });
	}
};

// Update a post
const updatePost = async (req, res) => {
	const { id } = req.params;
	const { title, content, slug, excerpt, published } = req.body;

	try {
		const updated = await prisma.post.update({
			where: { id: parseInt(id) },
			data: { title, content, slug, excerpt, published },
		});
		res.json(updated);
	} catch (error) {
		res.status(500).json({ error: "Failed to update post" });
	}
};

// Delete a post
const deletePost = async (req, res) => {
	const { id } = req.params;

	try {
		await prisma.post.delete({
			where: { id: parseInt(id) },
		});
		res.json({ message: "Post deleted" });
	} catch (error) {
		res.status(500).json({ error: "Failed to delete post" });
	}
};

module.exports = { getAllPosts, getPostById, createPost, updatePost, deletePost };
