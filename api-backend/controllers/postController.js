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

// Get a post by slug (and include post comments)
const getPostBySlug = async (req, res) => {
	const { slug } = req.params;

	try {
		const post = await prisma.post.findUnique({
			where: { slug },
			include: {
				author: true,
				comments: {
					include: { author: true },
				},
			},
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
	const { title, content, slug, excerpt, published } = req.body;
	const authorId = req.user.userId;

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
		const post = await prisma.post.findUnique({
			where: { id: parseInt(id) },
		});

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		await prisma.post.delete({
			where: { id: parseInt(id) },
		});
		res.status(200).json({ message: "Post deleted successfully" });
	} catch (error) {
		console.error("Error deleting post:", error);
		res.status(500).json({ error: "Failed to delete post" });
	}
};

// Publish/unpublish a post
const togglePublish = async (req, res) => {
	const { id } = req.params;
	const { published } = req.body;

	try {
		const updatedBlogPost = await prisma.post.update({
			where: { id: parseInt(id)},
			data: { published },
		});

		res.json(updatedBlogPost);;
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Failed to update published status" });
	}
};

module.exports = { 
	getAllPosts, 
	getPostById, 
	getPostBySlug, 
	createPost, 
	updatePost, 
	deletePost,
	togglePublish
};
