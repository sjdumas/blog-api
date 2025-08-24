const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Helper: map Prisma errors to API-friendly messages
function mapPrismaError(err) {
	// Unique constraint (e.g., slug)
	if (err?.code === "P2002") {
		const fields = (err?.meta?.target || []).join(", ");
		return { status: 409, body: { error: `Duplicate value for unique field(s): ${fields || "unknown"}` } };
	}
	return null;
}

// Always return PUBLISHED only, sorted by publishedAt when available
// GET /api/posts/public
// Public-only list. Always returns PUBLISHED posts with pagination + optional search.
const getPublicPosts = async (req, res) => {
	try {
		const page = Math.max(1, parseInt(req.query.page) || 1);
		const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 10));
		const q = (req.query.q || "").trim();

		const where = {
			status: "PUBLISHED",
			...(q
				? {
					OR: [
						{ title: { contains: q, mode: "insensitive" } },
						{ excerpt: { contains: q, mode: "insensitive" } },
						{ content: { contains: q, mode: "insensitive" } },
						{ author: { username: { contains: q, mode: "insensitive" } } },
					],
				}
				: {}),
		};

		const [total, posts] = await prisma.$transaction([
			prisma.post.count({ where }),
			prisma.post.findMany({
				where,
				orderBy: [
					{ publishedAt: "desc" }, // newest published first
					{ createdAt: "desc" },   // fallback for older drafts later published
				],
				skip: (page - 1) * pageSize,
				take: pageSize,
				select: {
					id: true,
					slug: true,
					title: true,
					excerpt: true,
					publishedAt: true,
					createdAt: true,
					author: { select: { username: true } },
				},
			}),
		]);

		res.json({
			data: posts,
			page,
			pageSize,
			total,
			totalPages: Math.max(1, Math.ceil(total / pageSize)),
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Failed to fetch public posts" });
	}
};

// GET /api/posts?status=PUBLISHED|DRAFT&page=&pageSize=&q=
const getAllPosts = async (req, res) => {
	try {
		const page = Math.max(1, parseInt(req.query.page) || 1);
		const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 10));
		const q = (req.query.q || "").trim();

		// Whitelist status to avoid unexpected values
		let status = req.query.status;
		if (status && !["PUBLISHED", "DRAFT"].includes(status)) status = undefined;

		const where = {
			...(status ? { status } : {}),
			...(q
				? {
					OR: [
						{ title: { contains: q, mode: "insensitive" } },
						{ content: { contains: q, mode: "insensitive" } },
						{ author: { username: { contains: q, mode: "insensitive" } } },
						{ author: { email: { contains: q, mode: "insensitive" } } },
					],
				}
				: {}),
		};

		const [total, posts] = await prisma.$transaction([
			prisma.post.count({ where }),
			prisma.post.findMany({
				where,
				orderBy: { createdAt: "desc" },
				skip: (page - 1) * pageSize,
				take: pageSize,
				include: { author: { select: { username: true, email: true } } },
			}),
		]);

		res.json({
			data: posts,
			page,
			pageSize,
			total,
			totalPages: Math.max(1, Math.ceil(total / pageSize)),
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Failed to fetch posts" });
	}
};

// Admin-only: GET /api/posts/manage?status=ALL|DRAFT|PUBLISHED&page=&pageSize=&q=
const getManagePosts = async (req, res) => {
	try {
		const page = Math.max(1, parseInt(req.query.page) || 1);
		const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 10));
		const q = (req.query.q || "").trim();

		// Accept ALL | DRAFT | PUBLISHED for admins
		const rawStatus = (req.query.status || "ALL").toUpperCase();
		const status = ["ALL", "DRAFT", "PUBLISHED"].includes(rawStatus) ? rawStatus : "ALL";

		const where = {
			...(status !== "ALL" ? { status } : {}),
			...(q
				? {
					OR: [
						{ title: { contains: q, mode: "insensitive" } },
						{ content: { contains: q, mode: "insensitive" } },
						{ author: { username: { contains: q, mode: "insensitive" } } },
						{ author: { email: { contains: q, mode: "insensitive" } } },
					],
				}
				: {}),
		};

		const [total, posts] = await prisma.$transaction([
			prisma.post.count({ where }),
			prisma.post.findMany({
				where,
				orderBy: { createdAt: "desc" },
				skip: (page - 1) * pageSize,
				take: pageSize,
				include: { author: { select: { username: true, email: true } } },
			}),
		]);

		res.json({
			data: posts,
			page,
			pageSize,
			total,
			totalPages: Math.max(1, Math.ceil(total / pageSize)),
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Failed to fetch managed posts" });
	}
};


// Protected: get a single post by ID (admin or author — guarded in routes)
const getPostById = async (req, res) => {
	const { id } = req.params;

	try {
		const post = await prisma.post.findUnique({
			where: { id: parseInt(id, 10) },
			include: {
				author: true,
				comments: { include: { author: true } },
			},
		});
		if (!post) return res.status(404).json({ error: "Post not found" });
		res.json(post);
	} catch (error) {
		res.status(500).json({ error: "Error fetching post" });
	}
};

// Public: get a post by slug (only published)
const getPostBySlug = async (req, res) => {
	const { slug } = req.params;

	try {
		const post = await prisma.post.findFirst({
			where: { slug, status: "PUBLISHED" },
			include: {
				author: true,
				comments: { include: { author: true } },
			},
		});
		if (!post) return res.status(404).json({ error: "Post not found" });
		res.json(post);
	} catch (error) {
		res.status(500).json({ error: "Error fetching post" });
	}
};

const createPost = async (req, res) => {
	const { title, content, slug, excerpt } = req.body;
	const authorId = req.user.userId;

	try {
		const newPost = await prisma.post.create({
			data: { title, content, slug, excerpt, authorId },
			include: { author: { select: { username: true, email: true } } },
		});
		res.status(201).json(newPost);
	} catch (error) {
		const mapped = mapPrismaError(error);
		if (mapped) return res.status(mapped.status).json(mapped.body);
		console.error(error);
		res.status(500).json({ error: "Failed to create post" });
	}
};

const updatePost = async (req, res) => {
	const { id } = req.params;
	const { title, content, slug, excerpt } = req.body;

	try {
		const updated = await prisma.post.update({
			where: { id: parseInt(id, 10) },
			data: { title, content, slug, excerpt },
			include: { author: { select: { username: true, email: true } } },
		});
		res.json(updated);
	} catch (error) {
		const mapped = mapPrismaError(error);
		if (mapped) return res.status(mapped.status).json(mapped.body);
		console.error(error);
		res.status(500).json({ error: "Failed to update post" });
	}
};

const deletePost = async (req, res) => {
	const { id } = req.params;

	try {
		const post = await prisma.post.findUnique({ where: { id: parseInt(id, 10) } });
		if (!post) return res.status(404).json({ error: "Post not found" });

		await prisma.post.delete({ where: { id: parseInt(id, 10) } });
		res.status(200).json({ message: "Post deleted successfully" });
	} catch (error) {
		console.error("Error deleting post:", error);
		res.status(500).json({ error: "Failed to delete post" });
	}
};

const publishPost = async (req, res) => {
	try {
		const id = parseInt(req.params.id, 10);
		const updated = await prisma.post.update({
			where: { id },
			data: { status: "PUBLISHED", publishedAt: new Date() },
			include: { author: { select: { username: true, email: true } } },
		});
		res.json(updated);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Failed to publish post" });
	}
};

const unpublishPost = async (req, res) => {
	try {
		const id = parseInt(req.params.id, 10);
		const updated = await prisma.post.update({
			where: { id },
			data: { status: "DRAFT", publishedAt: null },
			include: { author: { select: { username: true, email: true } } },
		});
		res.json(updated);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Failed to unpublish post" });
	}
};

module.exports = {
	getAllPosts,
	getPublicPosts,
	getManagePosts,
	getPostById,
	getPostBySlug,
	createPost,
	updatePost,
	deletePost,
	publishPost,
	unpublishPost,
};
