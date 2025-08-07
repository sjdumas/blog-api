const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "yoursecretkey";

// Signup controller
const signup = async (req, res) => {
	const { username, email, password } = req.body;

	try {
		const existing = await prisma.user.findUnique({ 
			where: { email },
		});

		if (existing) return res.status(400).json({ error: "Email already in use" });

		const hashedPassword = await bcrypt.hash(password, 10);
		const user = await prisma.user.create({
			data: {
				username,
				email,
				password: hashedPassword,
			},
		});
		res.status(201).json({ message: "User created", user: {id: user.id, username: user.username }});
	} catch (error) {
		res.status(500).json({ error: "Signup failed" });
	}
};

// Login controller
const login = async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await prisma.user.findUnique({
			where: { email },
		});
		if (!user) return res.status(400).json({ error: "Invalid credentials" });

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

		const token = jwt.sign(
			{ 
				userId: user.id,
				email: user.email,
				isAdmin: user.isAdmin,
			}, 
			JWT_SECRET, 
			{ expiresIn: "1h" });
			res.json({
				message: "Login successful",
				token,
				user: {
					id: user.id,
					username: user.username,
					email: user.email,
					isAdmin: user.isAdmin,
			},
		});

	} catch (error) {
		res.status(500).json( {error: "Login failed" });
	}
};

module.exports = { signup, login };
