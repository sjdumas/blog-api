import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE } from "../lib/api";
import { authHeaders } from "../lib/auth";

export default function EditPost() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [loading, setLoading] = useState(true);
	const [err, setErr] = useState("");

	useEffect(() => {
		const fetchPost = async () => {
			setErr("");
			setLoading(true);
			try {
				// NOTE: protected ID route requires Authorization
				const res = await fetch(`${API_BASE}/api/posts/id/${id}`, {
					headers: authHeaders(),
				});
				const data = await res.json().catch(() => ({}));
				if (!res.ok) throw new Error(data?.error || `Failed to load post (${res.status})`);

				setTitle(data.title || "");
				setContent(data.content || "");
			} catch (error) {
				console.error("Error fetching post", error);
				setErr(error.message || "Error fetching post");
			} finally {
				setLoading(false);
			}
		};

		fetchPost();
	}, [id]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setErr("");
		try {
			const res = await fetch(`${API_BASE}/api/posts/${id}`, {
				method: "PUT",
				headers: authHeaders({ "Content-Type": "application/json" }),
				body: JSON.stringify({ title, content }),
			});

			const data = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(data?.error || `Failed to update post (${res.status})`);

			// Go back to the admin posts list
			navigate("/admin/posts", { replace: true });
		} catch (error) {
			console.error(error);
			setErr(error.message || "Error updating post");
		}
	};

	if (loading) return <p>Loading...</p>;

	return (
		<div className="max-w-2xl mx-auto mt-10">
			<h2 className="text-2xl font-bold mb-4">Edit Post</h2>
			{err && <p className="text-red-600 mb-3">{err}</p>}
			<form onSubmit={handleSubmit} className="space-y-4">
				<input
					type="text"
					className="w-full border px-3 py-2"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					required
				/>
				<textarea
					className="w-full border px-3 py-2"
					rows="8"
					value={content}
					onChange={(e) => setContent(e.target.value)}
					required
				/>
				<button
					type="submit"
					className="bg-blue-600 text-white px-4 py-2 rounded"
				>
					Update Post
				</button>
			</form>
		</div>
	);
};
