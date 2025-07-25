const express = require("express");
const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentsRoutes");

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);

app.get("/", (req, res) => {
	res.send(`It's working! It's working! Blog API is working!`);
});

// Test Prisma connection
app.get("/test-db", async (req, res) => {
	const users = await prisma.user.findMany();
	res.json(users);
});

app.listen(PORT, () => {
	console.log(`Express server is running at http://localhost:${PORT}`);
});
