import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
	const [posts, setPosts] = useState([]);

	useEffect(() => {
		const fetchPosts = async () => {
			try {
				const res = await fetch("http://localhost:3000/api/posts");
				const data = await res.json();

				setPosts(data);
			} catch (error) {
				console.error("Error fetching posts", error);
			}
		};

		fetchPosts();
	}, []);

	const handleDelete = async (id) => {
		if (!confirm("Are you sure you want to delete this post?")) return;

		try {
			const res = await fetch(`http://localhost:3000/api/posts/${id}`, {
				method: "DELETE",
			});

			if (res.ok) {
				setPosts(posts.filter((post) => post.id !== id));
			} else {
				console.error("Failed to delete post");
			}
		} catch (error) {
			console.error("Error deleting post", error);
		}
	};

	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
			{posts.length === 0 ? (
				<p>No posts found.</p>
			) : (
				<table className="w-full border">
					<thead>
						<tr>
							<th className="border px-4 py-2">Title</th>
							<th className="border px-4 py-2">Slug</th>
							<th className="border px-4 py-2">Published</th>
							<th className="border px-4 py-2">Actions</th>
						</tr>
					</thead>
					<tbody>
						{posts.map((post) => (
						<tr key={post.id}>
							<td className="border px-4 py-2">{post.title}</td>
							<td className="border px-4 py-2">{post.slug}</td>
							<td className="border px-4 py-2">{post.published ? "Yes" : "No"}</td>
							<td className="border px-4 py-2">
								<Link to={`/edit/${post.id}`} className="text-blue-600 mr-2">Edit</Link>
								<button 
								className="text-red-600"
								onClick={handleDelete(post.id)}
								>
									Delete
								</button>
							</td>
						</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
};
