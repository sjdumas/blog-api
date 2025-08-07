import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
	const [posts, setPosts] = useState([]);
	const [toastMessage, setToastMessage] = useState("");

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

				setToastMessage("Post deleted successfully!");

				setTimeout(() => {
					setToastMessage("");
				}, 3000);
			} else {
				console.error("Failed to delete post");
			}
		} catch (error) {
			console.error("Error deleting post", error);
		}
	};

	const handleTogglePublish = async (postId, currentStatus) => {
		try {
			const res = await fetch(`http://localhost:3000/api/posts/${postId}/publish`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ published: !currentStatus }),
			});

			if (res.ok) {
			setPosts((prev) =>
				prev.map((post) =>
				post.id === postId ? { ...post, published: !currentStatus } : post
				)
			);
			setToastMessage(`Post ${!currentStatus ? "published" : "unpublished"} successfully`);
			setTimeout(() => setToastMessage(""), 3000);
			} else {
			setToastMessage("Failed to update post status");
			setTimeout(() => setToastMessage(""), 3000);
			}
		} catch (error) {
			console.error(error);
			setToastMessage("Error updating post status");
			setTimeout(() => setToastMessage(""), 3000);
		}
	};

	return (
		<div className="p-4">
			<h1 className="text-2xl mb-4">Admin Dashboard</h1>
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
									onClick={() => handleDelete(post.id)}
								>
									Delete
								</button>
							</td>
							<td className="border px-4 py-2">
								<button
									className={`px-2 py-1 rounded ${
										post.published ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-400 hover:bg-gray-500'
									} text-white`}
									onClick={() => handleTogglePublish(post.id, post.published)}
									>
									{post.published ? 'Unpublish' : 'Publish'}
								</button>
							</td>
						</tr>
						))}
					</tbody>
				</table>
			)}
			{toastMessage && (
				<div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
					{toastMessage}
				</div>
			)}
		</div>
	);
};
