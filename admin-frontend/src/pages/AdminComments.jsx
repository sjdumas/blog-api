import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { API_BASE } from "../lib/api";
import { authHeaders, clearAuth } from "../lib/auth";
import FormField from "../components/FormField";
import Button from "../components/Button";

export default function AdminComments() {
	const [comments, setComments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [editCommentId, setEditCommentId] = useState(null);
	const [editedContent, setEditedContent] = useState("");
	const [rawSearch, setRawSearch] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedPostId, setSelectedPostId] = useState("all");
	const [posts, setPosts] = useState([]);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(5);
	const [serverTotal, setServerTotal] = useState(0);

	useEffect(() => {
		const t = setTimeout(() => setSearchTerm(rawSearch), 200);
		return () => clearTimeout(t);
	}, [rawSearch]);

	useEffect(() => {
		const controller = new AbortController();
		const fetchComments = async () => {
			setError("");
			setLoading(true);
			try {
				const params = new URLSearchParams();
				params.append("page", String(page));
				params.append("pageSize", String(pageSize));
				if (searchTerm.trim()) params.append("q", searchTerm.trim());
				if (selectedPostId !== "all") params.append("postId", selectedPostId);

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
				if (!res.ok) throw new Error(json.error || `Failed to fetch comments (${res.status})`);

				setComments(Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []);
				if (typeof json.total === "number") setServerTotal(json.total);
			} catch (e) {
				if (e.name === "AbortError") return;
				setError(e.message || "Failed to fetch comments");
			} finally {
				setLoading(false);
			}
		};

		fetchComments();
		return () => controller.abort();
	}, [page, pageSize, searchTerm, selectedPostId]);

	useEffect(() => {
		const controller = new AbortController();
		const fetchPosts = async () => {
			try {
				const res = await fetch(
					`${API_BASE}/api/posts?status=PUBLISHED&page=1&pageSize=1000`,
					{ signal: controller.signal }
				);
				const data = await res.json().catch(() => ({}));
				if (!res.ok) throw new Error(data.error || `Failed to fetch posts (${res.status})`);
				const list = Array.isArray(data) ? data : data.data || [];
				setPosts(list);
			} catch (e) {
				if (e.name !== "AbortError") console.error(e);
			}
		};
		fetchPosts();
		return () => controller.abort();
	}, []);

	const handleDeleteClick = async (id) => {
		if (!window.confirm("Are you sure you want to delete this comment?")) return;

		const p = (async () => {
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

			const wasLastItemOnPage = comments.length === 1 && page > 1;
			setComments((prev) => prev.filter((c) => c.id !== id));
			setServerTotal((t) => Math.max(0, t - 1));
			if (wasLastItemOnPage) setPage((p) => Math.max(1, p - 1));
		})();

		toast.promise(p, {
			loading: "Deleting comment…",
			success: "Comment deleted",
			error: (e) => e.message || "Error deleting comment",
		});
	};

	const handleEditClick = (comment) => {
		setEditCommentId(comment.id);
		setEditedContent(comment.content);
	};

	const handleEditSubmit = async (e) => {
		e.preventDefault();
		const p = (async () => {
			const res = await fetch(`${API_BASE}/api/comments/${editCommentId}`, {
				method: "PUT",
				headers: authHeaders({ "Content-Type": "application/json" }),
				body: JSON.stringify({ content: editedContent }),
			});

			if (res.status === 401) {
				clearAuth();
				window.location.assign("/login");
				return;
			}
			if (!res.ok) {
				let msg = "Failed to update comment";
				try {
					const data = await res.json();
					if (data?.error) msg = data.error;
				} catch { }
				throw new Error(msg);
			}

			const updatedComment = await res.json();
			setComments((prev) =>
				prev.map((c) =>
					c.id === editCommentId ? { ...updatedComment, author: c.author ?? updatedComment.author } : c
				)
			);

			setEditCommentId(null);
			setEditedContent("");
		})();

		toast.promise(p, {
			loading: "Saving changes…",
			success: "Comment updated",
			error: (e) => e.message || "Error updating comment",
		});
	};

	const totalPages = Math.max(1, Math.ceil(serverTotal / pageSize));
	const originalContent = comments.find((c) => c.id === editCommentId)?.content ?? "";
	const isUnchanged = editedContent.trim() === originalContent.trim();
	const isInvalid = editedContent.trim().length === 0;

	return (
		<div className="p-4">
			<Toaster position="top-right" />
			<h1 className="text-2xl mb-4">Moderate Comments</h1>
			{loading && <p>Loading comments...</p>}
			{error && <p className="text-red-500">{error}</p>}

			<div className="flex flex-col sm:flex-row gap-4 my-6">
				<FormField
					as="select"
					name="postFilter"
					label=""
					value={selectedPostId}
					onChange={(e) => { setSelectedPostId(e.target.value); setPage(1); }}
					options={[
						{ value: "all", label: "All Posts" },
						...posts.map((p) => ({ value: p.id, label: p.title }))
					]}
				/>
				<FormField
					name="searchComments"
					label=""
					placeholder="Search comments..."
					value={rawSearch}
					onChange={(e) => { setRawSearch(e.target.value); setPage(1); }}
				/>
			</div>

			{comments.length === 0 && !loading ? (
				<p>No comments found.</p>
			) : (
				<>
					{editCommentId && (
						<form onSubmit={handleEditSubmit} className="mb-4">
							<textarea
								className="w-full border p-2 rounded"
								value={editedContent}
								onChange={(e) => setEditedContent(e.target.value)}
							/>
							<div className="space-x-2 mt-2">
								<Button type="submit" disabled={isInvalid || isUnchanged}>
									Save
								</Button>
								<Button variant="outline" type="button" onClick={() => { setEditCommentId(null); setEditedContent(""); }}>
									Cancel
								</Button>
							</div>
						</form>
					)}

					<ul className="space-y-4">
						{comments.map((comment) => (
							<li key={comment.id} className="border-b pb-2">
								<p>{comment.content}</p>
								<p className="text-sm text-gray-500">— {comment.author?.email || comment.email}</p>
								<div className="my-4 space-x-2">
									<Button variant="outline" buttonType="small" onClick={() => handleEditClick(comment)}>
										Edit
									</Button>
									<Button variant="warning" buttonType="small" onClick={() => handleDeleteClick(comment.id)}>
										Delete
									</Button>
								</div>
							</li>
						))}
					</ul>

					<div className="flex items-center justify-between mt-4">
						<div className="text-xs text-gray-500">
							Page {page} of {totalPages} • {serverTotal} total
						</div>
						<div className="flex gap-2">
							<Button
								variant="outline"
								buttonType="small"
								disabled={page <= 1}
								onClick={() => setPage((p) => Math.max(1, p - 1))}
							>
								Prev
							</Button>
							<Button
								variant="outline"
								buttonType="small"
								disabled={page >= totalPages}
								onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
							>
								Next
							</Button>
							<FormField
								as="select"
								name="pageSize"
								value={pageSize}
								className="mt-0"
								onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
								options={[5, 10, 20, 50].map((n) => ({ value: n, label: `${n} / page` }))}
							/>
						</div>
					</div>
				</>
			)}
		</div>
	);
};
