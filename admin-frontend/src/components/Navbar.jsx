import { Link, useNavigate, useLocation } from "react-router-dom";
import { getUser, clearAuth } from "../lib/auth";
import { useEffect, useState } from "react";
import Button from "./Button";

export default function Navbar() {
	const navigate = useNavigate();
	const location = useLocation();
	const [user, setUser] = useState(null);
	const [hydrated, setHydrated] = useState(false);

	// Hydrate user info on mount AND whenever location changes
	useEffect(() => {
		setUser(getUser());
		setHydrated(true);
	}, [location]);

	const handleLogout = () => {
		clearAuth();
		setUser(null); // update UI immediately
		navigate("/", { replace: true });
	};

	if (!hydrated) {
		return (
			<nav className="bg-gray-800 text-white p-4">
				<div className="max-w-6xl mx-auto flex justify-between">
					<span className="font-bold">Blog Admin</span>
				</div>
			</nav>
		);
	}

	return (
		<nav className="bg-gray-800 text-white py-4 px-8">
			<div className="flex justify-between items-center">
				<div className="flex items-center space-x-4">
					{user?.isAdmin ? (
						<Link to="/" className="hover:opacity-90">
							Dashboard
						</Link>
					) : (
						<Link to="/" className="hover:opacity-90">
							Blog Admin Panel
						</Link>
					)}

					{user?.isAdmin && (
						<>
							<Link to="/posts/new" className="hover:opacity-90">
								New Post
							</Link>
							<Link to="/admin/posts" className="hover:opacity-90">
								Posts
							</Link>
							<Link to="/admin/comments" className="hover:opacity-90">
								Comments
							</Link>
						</>
					)}

					{user && (
						<Link to="/comments" className="hover:opacity-90">
							My Comments
						</Link>
					)}
				</div>

				<div className="flex items-center space-x-4">
					{user ? (
						<>
							<span className="text-sm text-gray-300">{user.email}</span>
							<Button
								onClick={handleLogout}
								variant="secondary"
								buttonType="small"
							>
								Logout
							</Button>
						</>
					) : (
						<Link to="/login" className="hover:opacity-90">
							Login
						</Link>
					)}
				</div>
			</div>
		</nav>
	);
};
