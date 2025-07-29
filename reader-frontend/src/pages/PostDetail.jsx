import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function PostDetail() {
	const { slug } = useParams();
	const [post, setPost] = useState(null);
	const [comment, setComment] = useState("");
	const [commentText, setCommentText] = useState("");
	const [comments, setComments] = useState([]);
	const [error, setError] = useState("");
	const [submitError, setSubmitError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchPost = async () => {
			try {
				const response = await fetch(`http://localhost:3000/api/posts/${slug}`);
				const data = await response.json();
				
				setPost(data);
				setComments(data.comments || []);
			} catch (error) {
				console.error("Error fetching post:", error);
			}
		};

		fetchPost();
	}, [slug]);

	if (error) return <p>Error: {error}</p>
	if (!post) return <p>Loading post...</p>

	const wordCount = post.content?.split(" ").length || 0;
	const readTime = Math.ceil(wordCount / 200);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitError("");

		const token = localStorage.getItem("token");

		if (!token) {
			setSubmitError("You must be logged in to comment.");
			return;
		}

		if (!commentText.trim()) return;

		setLoading(true);

		try {
			const response = await fetch("http://localhost:3000/api/comments", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					text: commentText,
					postId: post.id,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to submit comment");
			}

			const newComment = await response.json();

			setSuccessMessage("Your comment was posted!");
			setTimeout(() => { 
				setSuccessMessage("");
			}, 3000); // Clear message after 3 seconds

			// Clear the form
			setCommentText("");

			// Refresh the comments
			setPost((prev) => ({
				...prev,
				comments: [...prev.comments, newComment],
			}));
		} catch (error) {
			setSubmitError(error.message || "Something went wrong");
			setErrorMessage("Failed to post comment. Please try again.");
			setTimeout(() => {
				setErrorMessage("");
				setSuccessMessage("");
			}, 3000); // Clear message after 3 seconds
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="post">
			<h2 className="text-2xl font-semibold mb-1">{post.title}</h2>
			<div className="text-sm text-gray-500 mb-4">
				By {post.author?.username || "Unknown"} ·{" "}
				{new Date(post.createdAt).toLocaleDateString(undefined, {
					year: "numeric",
					month: "short",
					day: "numeric",
				})} · {readTime} min read
			</div>
			<p><strong>Excerpt:</strong> {post.excerpt}</p>
			<div className="post-content">
				<p>{post.content}</p>
				<Link to="/" className="text-blue-600 hover:underline block mb-4">
					← Back to all posts
				</Link>
			</div>
			<div className="all-comments">
				<div className="mt-6">
					<h3 className="text-lg font-semibold mb-2">Comments</h3>
					{comments.length > 0 ? (
						<ul className="space-y-4">
						{comments.map((comment) => (
							<div key={comment.id} className="mb-4 border-b pb-2">
								<p className="text-gray-700">{comment.content}</p>
								<div className="text-xs text-gray-500 mt-1">
									{comment.author?.username || "Anonymous"} ·{" "}
									{new Date(comment.createdAt).toLocaleString()}
								</div>
							</div>
						))}
						</ul>
					) : (
						<p className="text-gray-500">No comments yet.</p>
					)}
				</div>
			</div>
			<div className="comment-form">
				<form onSubmit={handleSubmit} className="space-y-2 mt-4">
					<textarea
						className="w-full p-2 border border-gray-300 rounded"
						rows="3"
						value={commentText}
						onChange={(e) => setCommentText(e.target.value)}
						placeholder="Add a comment..."
					></textarea>
					<button
						type="submit"
						className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
						disabled={loading}
					>
						{loading ? "Posting..." : "Post Comment"}
					</button>
					{submitError && (
						<p className="text-red-500 text-sm">{submitError}</p>
					)}
					{successMessage && (
						<div className="text-green-600 text-sm mb-2">{successMessage}</div>
					)}
					{errorMessage && (
						<div className="text-red-600 text-sm mb-2">{errorMessage}</div>
					)}
				</form>
			</div>
		</div>
	);
};
