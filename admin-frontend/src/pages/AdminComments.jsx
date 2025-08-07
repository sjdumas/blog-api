import { useEffect, useState } from "react";

export default function AdminComments() {
	const [comments, setComments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [editCommentId, setEditCommentId] = useState(null);
	const [editedContent, setEditedContent] = useState("");

	useEffect(() => {
		const fetchComments = async () => {
			try {
				const res = await fetch("http://localhost:3000/api/comments");
				const data = await res.json();

				if (!res.ok) throw new Error(data.error || "Failed to fetch comments");

				setComments(data);
			} catch (error) {
				setError(error.message);
			} finally {
				setLoading(false);
			}
		};

		fetchComments();
	}, []);

	const handleDeleteClick = async (id) => {
		const confirmDelete = window.confirm("Are you sure you want to delete this comment?");

		if (!confirmDelete) return;

		try {
			const res = await fetch(`http://localhost:3000/api/comments/${id}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});

			if (!res.ok) throw new Error("Failed to delete comment");

			setComments((prev) => prev.filter((comment) => comment.id !== id));
		} catch (error) {
			console.error(error);
			alert("Error deleting comment");
		}
	};

	const handleEditClick = (comment) => {
		setEditCommentId(comment.id);
		setEditedContent(comment.content);
	};

	const handleEditSubmit = async (e) => {
		e.preventDefault();

		try {
			const res = await fetch(`http://localhost:3000/api/comments/${editCommentId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify({ content: editedContent }),
			});

			if (!res.ok) {
				throw new Error("Failed to update comment");
			}

			const updatedComment = await res.json();

			setComments((prevComments) =>
			prevComments.map((comment) =>
				comment.id === editCommentId ? updatedComment : comment
			)
			);

			setEditCommentId(null);
			setEditedContent("");
		} catch (error) {
			console.error(error);
			alert("Error updating comment");
		}
	};

	return (
		<div className="p-4">
			<h1 className="text-2xl mb-4">All Comments</h1>
			{loading && <p>Loading comments...</p>}
			{error && <p className="text-red-500">{error}</p>}
			<ul className="space-y-4">
				{comments.map((comment) => (
					<li
						key={comment.id}
						className="p-4 border rounded"
					>
						{editCommentId === comment.id ? (
							<form onSubmit={handleEditSubmit} className="space-y-2">
								<textarea
									className="w-full border p-2 rounded"
									value={editedContent}
									onChange={(e) => setEditedContent(e.target.value)}
								/>
								<div className="space-x-2">
								<button
									type="submit"
									className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
								>
									Save
								</button>
								<button
									type="button"
									className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
									onClick={() => setEditCommentId(null)}
								>
									Cancel
								</button>
								</div>
							</form>
							) : (
							<>
							<p className="text-gray-800 text-base">{comment.content}</p>
							<p className="text-gray-500 text-sm">
								By: {comment.author?.username} ({comment.author?.email}) | On Post ID: {comment.postId}
							</p>
							<div className="mt-2 space-x-2">
								<button
									className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
									onClick={() => handleEditClick(comment)}
								>
									Edit
								</button>
								<button
									className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
									onClick={() => handleDeleteClick(comment.id)}
								>
									Delete
								</button>
							</div>
						</>
						)}
					</li>
				))}
			</ul>
		</div>
	);
};
