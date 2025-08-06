import { useEffect, useState } from "react";

export default function Comments() {
	const [comments, setComments] = useState([]);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);
	const [editingCommentId, setEditingCommentId] = useState(null);
	const [editedContent, setEditedContent] = useState("");

	const [user, setUser] = useState(() => {
		try {
			return JSON.parse(localStorage.getItem("user"));
		} catch {
			return null;
		}
	});

	useEffect(() => {
		const fetchComments = async () => {
			try {
				const res = await fetch("http://localhost:3000/api/comments", {
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				});

				if (!res.ok) throw new Error("Failed to fetch comments");

				const data = await res.json();
				setComments(data);
			} catch (error) {
				console.error(error);
				setError("Error fetching comments");
			} finally {
				setLoading(false);
			}
		};

		fetchComments();
	}, []);

	const handleEditClick = (comment) => {
		setEditingCommentId(comment.id);
		setEditedContent(comment.content);
	};

	const handleCancelEdit = () => {
		setEditingCommentId(null);
		setEditedContent("");
	};

	const handleEdit = async (comment) => {
		try {
			const res = await fetch(`http://localhost:3000/api/comments/${comment.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify({ content: editedContent }),
			});

			if (!res.ok) throw new Error("Failed to update comment");

			const updatedComment = await res.json();

			setComments((prev) =>
				prev.map((c) => (c.id === updatedComment.id ? updatedComment : c))
			);

			setEditingCommentId(null);
			setEditedContent("");
		} catch (error) {
			console.error(error);
			setError("Error updating comment");
		}
	};

	const handleDelete = async (id) => {
		try {
			const res = await fetch(`http://localhost:3000/api/comments/${id}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});

			if (!res.ok) throw new Error("Failed to delete comment");

			setComments((prev) => prev.filter((c) => c.id !== id));
		} catch (error) {
			console.error(error);
			setError("Error deleting comment");
		}
};

	if (loading) return <p>Loading comments...</p>
	if (error) return <p>{error}</p>

	return (
		<div className="max-w-4xl mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">All Comments</h1>
			{comments.length === 0 ? (
				<p>No comments found.</p>
				) : (
				<ul className="space-y-4">
					{comments.map((comment) => (
						<div key={comment.id} className="comment border-b py-2">
							{editingCommentId === comment.id ? (
								<div className="space-y-2">
									<textarea
										className="w-full border p-2 rounded"
										value={editedContent}
										onChange={(e) => setEditedContent(e.target.value)}
									/>
									<div className="space-x-2">
										<button onClick={() => handleEdit(comment)} className="text-green-500 hover:underline">
											Save
										</button>
										<button onClick={handleCancelEdit} className="text-gray-500 hover:underline">
											Cancel
										</button>
									</div>
								</div>
							) : (
								<p>{comment.content}</p>
							)}
							<p className="text-sm text-gray-500">— {comment.author?.email}</p>

							{/* Only show buttons if logged-in user is the comment author */}
							{user?.email === comment.author?.email && (
							<div className="mt-1 space-x-2">
								<button
									onClick={() => handleEdit(comment)}
									className="text-blue-500 hover:underline"
								>
									Edit
								</button>
								<button
									onClick={() => handleDelete(comment.id)}
									className="text-red-500 hover:underline"
								>
									Delete
								</button>
							</div>
							)}
						</div>
					))}
				</ul>
			)}
		</div>
	);
};