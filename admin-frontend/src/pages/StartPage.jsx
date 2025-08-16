import { Link } from "react-router-dom";

export default function StartPage() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen gap-6">
			<h1 className="text-4xl font-bold">Welcome to the Blog Admin Panel</h1>
			<p className="text-lg max-w-md text-center">Please log in to access your dashboard and manage posts and comments.</p>
			<Link
				to="/login"
				className="w-30 text-center px-6 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
			>
				Login
			</Link>
		</div>
	);
};
