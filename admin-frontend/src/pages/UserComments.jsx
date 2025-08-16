import { useEffect, useState } from "react";
import { API_BASE } from "../lib/api";
import { authHeaders, clearAuth, getUser } from "../lib/auth";
import Button from "../components/Button";

export default function UserComments() {
	const [comments, setComments] = useState([]);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);
	const [editingCommentId, setEditingCommentId] = useState(null);
	const [editedContent, setEditedContent] = useState("");

	const user = getUser();

	useEffect(() => {
		const controller = new AbortController();

		const fetchComments = async () => {
			setError("");
			setLoading(true);
			try {
				const params = new URLSearchParams({ page: "1", pageSize: "1000" });
				const res = await fetch(`${API_BASE}/api/comments?${params.toString()}`, {
					headers: authHeaders(),
					signal: controller.signal,
				});

				if (res.status === 401) {
					clearAuth();
					window.location.assign("/login");
					return;
				}

				const json = await res.json().catch(() => ({}));
				if (!res.ok) throw new Error(json?.error || `Failed to fetch comments (${res.status})`);

				const list = Array.isArray(json) ? json : json.data || [];
				const email = user?.email?.toLowerCase();

				const mine = email
					? list.filter((c) => (c.author?.email || c.email || "").toLowerCase() === email)
					: list;

				setComments(mine);
			} catch (err) {
				if (err.name !== "AbortError") {
					console.error(err);
					setError(err.message || "Error fetching comments");
				}
			} finally {
				setLoading(false);
			}
		};

		fetchComments();
		return () => controller.abort();
	}, [user?.email]);

	const startEdit = (comment) => {
		setEditingCommentId(comment.id);
		setEditedContent(comment.content || "");
	};

	const cancelEdit = () => {
		setEditingCommentId(null);
		setEditedContent("");
	};

	const saveEdit = async (commentId) => {
		try {
			const res = await fetch(`${API_BASE}/api/comments/${commentId}`, {
				method: "PUT",
				headers: authHeaders({ "Content-Type": "application/json" }),
				body: JSON.stringify({ content: editedContent }),
			});

			if (res.status === 401) {
				clearAuth();
				window.location.assign("/login");
				return;
			}

			const updated = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(updated?.error || `Failed to update comment (${res.status})`);

			setComments((prev) =>
				prev.map((c) => (c.id === commentId ? { ...updated, author: c.author ?? updated.author } : c))
			);
			cancelEdit();
		} catch (err) {
			console.error(err);
			setError(err.message || "Error updating comment");
		}
	};

	const remove = async (id) => {
		try {
			const res = await fetch(`${API_BASE}/api/comments/${id}`, {
				method: "DELETE",
				headers: authHeaders(),
			});

			if (res.status === 401) {
				clearAuth();
				window.location.assign("/login");
				return;
			}

			if (!res.ok) {
				let msg = "Failed to delete comment";
				try {
					const data = await res.json();
					if (data?.error) msg = data.error;
				} catch { }
				throw new Error(msg);
			}

			setComments((prev) => prev.filter((c) => c.id !== id));
		} catch (err) {
			console.error(err);
			setError(err.message || "Error deleting comment");
		}
	};

	if (loading) return <p>Loading comments...</p>;

	return (
		<div className="p-4">
			<h1 className="text-2xl mb-4">My Comments</h1>

			{error && <p className="text-red-600 mb-3">{error}</p>}

			{comments.length === 0 ? (
				<p>No comments found.</p>
			) : (
				<ul className="space-y-4">
					{comments.map((comment) => {
						const isEditing = editingCommentId === comment.id;
						const unchanged = editedContent.trim() === (comment.content || "").trim();
						const invalid = editedContent.trim().length === 0;

						return (
							<li key={comment.id} className="border-b py-3">
								{isEditing ? (
									<div className="space-y-2">
										<textarea
											className="w-full border p-2 rounded"
											value={editedContent}
											onChange={(e) => setEditedContent(e.target.value)}
										/>
										<div className="space-x-2">
											<Button onClick={() => saveEdit(comment.id)} disabled={invalid || unchanged} buttonType="small">
												Save
											</Button>
											<Button onClick={cancelEdit} variant="outline" buttonType="small">
												Cancel
											</Button>
										</div>
									</div>
								) : (
									<>
										<p>{comment.content}</p>
										<p className="text-sm text-gray-500">
											— {comment.author?.email || comment.email}
										</p>
										<div className="my-3 space-x-2">
											<Button onClick={() => startEdit(comment)} variant="outline" buttonType="small">
												Edit
											</Button>
											<Button onClick={() => remove(comment.id)} variant="warning" buttonType="small">
												Delete
											</Button>
										</div>
									</>
								)}
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
};
