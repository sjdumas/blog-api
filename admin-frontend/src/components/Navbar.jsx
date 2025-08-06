import { Link } from "react-router-dom";

export default function Navbar() {
	return (
		<nav className="p-4 bg-gray-800 text-white flex gap-4">
			<Link to="/">Dashboard</Link>
			<Link to="/posts/new">New Post</Link>
			<Link to="/login">Login</Link>
			<Link to="/comments">Comments</Link>
		</nav>
	);
};
