const adminOnly = (req, res, next) => {
	if (!req.user?.isAdmin) {
		return res.status(403).json({ error: "Admin access is required" });
	}
	next();
};

module.exports = adminOnly;
