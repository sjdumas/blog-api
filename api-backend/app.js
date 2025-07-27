const express = require("express");
const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
const cors = require("cors");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentsRoutes");
const authRoutes = require("./routes/authRoutes");
const verifyToken = require("./middleware/authMiddleware");

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
	res.send(`It's working! It's working! Blog API is working!`);
});

app.get("/api/protected", verifyToken, (req, res) => {
	res.json({ message: "You are authenticated!", userId: req.user.userId });
});

// Test Prisma connection
app.get("/test-db", async (req, res) => {
	const users = await prisma.user.findMany();
	res.json(users);
});

app.listen(PORT, () => {
	console.log(`Express server is running at http://localhost:${PORT}`);
});
