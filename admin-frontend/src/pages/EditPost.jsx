import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditPost() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchPost = async () => {
			try {
				const res = await fetch(`http://localhost:3000/api/posts/${id}`);
				const data = await res.json();

				setTitle(data.title);
				setContent(data.content);
				setLoading(false);
			} catch (error) {
				console.error("Error fetching post", error);
			}
		};

		fetchPost();
	}, [id]);

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			const res = await fetch(`http://localhost:3000/api/posts/${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ title, content }),
			});

			if (res.ok) {
				navigate("/");
			} else {
				console.error("Failed to update post");
			}
		} catch (error) {
			console.error(error);
		}
	};

	if (loading) return <p>Loading...</p>;

	return (
		<div className="max-w-2xl mx-auto mt-10">
			<h2 className="text-2xl font-bold mb-4">Edit Post</h2>
			<form onSubmit={handleSubmit} className="space-y-4">
				<input
					type="text"
					className="w-full border px-3 py-2"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
				/>
				<textarea
					className="w-full border px-3 py-2"
					rows="8"
					value={content}
					onChange={(e) => setContent(e.target.value)}
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
