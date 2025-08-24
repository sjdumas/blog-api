import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function PostDetail() {
	const { slug } = useParams();
	const [post, setPost] = useState(null);
	const [commentText, setCommentText] = useState("");
	const [comments, setComments] = useState([]);
	const [error, setError] = useState("");
	const [submitError, setSubmitError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			setLoading(true);
			setError("");
			try {
				const res = await fetch(`/api/posts/${slug}`);
				if (!res.ok) {
					const err = await res.json().catch(() => ({}));
					throw new Error(err?.error || `Post not found (status ${res.status})`);
				}
				const data = await res.json();
				if (cancelled) return;
				setPost(data);
				if (Array.isArray(data.comments)) setComments(data.comments);
			} catch (e) {
				if (!cancelled) setError(e.message || "Failed to load post.");
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [slug]);

	const token = localStorage.getItem("token");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitError("");
		setSuccessMessage("");

		if (!token) {
			setSubmitError("Please sign in to comment.");
			return;
		}
		if (!commentText.trim()) {
			setSubmitError("Comment cannot be empty.");
			return;
		}
		try {
			const res = await fetch(`/api/comments`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ body: commentText.trim(), postId: post.id }),
			});
			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				throw new Error(err?.error || "Failed to post comment.");
			}
			const newComment = await res.json();
			setComments((prev) => [newComment, ...prev]);
			setCommentText("");
			setSuccessMessage("Comment added!");
			setTimeout(() => setSuccessMessage(""), 2000);
		} catch (e) {
			setSubmitError(e.message || "Failed to post comment.");
		}
	};

	if (loading) return <p>Loading…</p>;
	if (error) return <p className="text-red-600">{error}</p>;
	if (!post) return <p>Post not found.</p>;

	const dateStr = post.publishedAt || post.createdAt;

	return (
		<article className="space-y-8">
			{/* title */}
			<div className="title">
				<h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
				<p className="text-sm text-slate-500">
					{post.author?.username ? `By ${post.author.username} · ` : ""}
					{new Date(dateStr).toLocaleString()}
				</p>
				{post.excerpt && (
					<p className="mt-4 italic text-slate-700">{post.excerpt}</p>
				)}
			</div>

			{/* content */}
			<div className="post-content">
				{post.content}
			</div>

			{/* comments */}
			<section className="space-y-4 post-comments">
				<h2 className="text-xl font-semibold">Comments</h2>

				{comments.length === 0 && (
					<p className="text-slate-600">No comments yet.</p>
				)}

				<ul className="space-y-3">
					{comments.map((c) => (
						<li key={c.id} className="rounded-xl border p-3">
							<p className="text-xs text-slate-500">
								{c.author?.username ? `${c.author.username} · ` : ""}
								{new Date(c.createdAt).toLocaleString()}
							</p>
							<p className="mt-1">{c.body}</p>
						</li>
					))}
				</ul>

				{/* comment form */}
				{!token ? (
					<div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
						Please sign in to comment.
					</div>
				) : (
					<form onSubmit={handleSubmit} className="space-y-2">
						<textarea
							value={commentText}
							onChange={(e) => setCommentText(e.target.value)}
							rows={4}
							className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-slate-300"
							placeholder="Share your thoughts…"
						/>
						<div className="flex items-center gap-3">
							<button
								type="submit"
								className="inline-flex items-center rounded-xl border bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
							>
								Post comment
							</button>
							{submitError && <p className="text-red-600 text-sm">{submitError}</p>}
							{successMessage && (
								<p className="text-green-600 text-sm">{successMessage}</p>
							)}
						</div>
					</form>
				)}
			</section>
		</article>
	);
}
