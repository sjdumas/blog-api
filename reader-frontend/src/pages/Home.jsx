import { useEffect, useState } from "react";
import PostList from "../components/PostList";

const PAGE_SIZE = 10; // keep your existing page size

export default function Home() {
	const [posts, setPosts] = useState([]);
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		let cancelled = false;

		const fetchPosts = async () => {
			try {
				setLoading(true);
				setError("");

				const res = await fetch(
					`http://localhost:3000/api/posts?status=PUBLISHED&page=${page}&pageSize=${PAGE_SIZE}`
				);

				const json = await res.json();
				if (!res.ok) throw new Error(json.error || "Failed to fetch posts");

				// Support both shapes:
				// 1) { data, total }
				// 2) [] (array fallback)
				const pageData = Array.isArray(json) ? json : json.data || [];
				const pageTotal = Array.isArray(json) ? json.length : json.total ?? pageData.length;

				if (!cancelled) {
					setPosts((prev) => (page === 1 ? pageData : [...prev, ...pageData]));
					setTotal(pageTotal);
				}
			} catch (error) {
				if (!cancelled) setError(error.message || "Something went wrong");
			} finally {
				if (!cancelled) setLoading(false);
			}
		};

		fetchPosts();
		return () => {
			cancelled = true;
		};
	}, [page]);

	const canLoadMore = posts.length < total;

	return (
		<div>
			<h1>Blog Posts</h1>

			{error && <p style={{ color: "red" }}>{error}</p>}

			<PostList posts={posts} />

			<div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
				{canLoadMore && (
					<button
						onClick={() => setPage((p) => p + 1)}
						disabled={loading}
						style={{
							padding: "0.5rem 1rem",
							borderRadius: "0.5rem",
							border: "1px solid #ccc",
							cursor: loading ? "not-allowed" : "pointer",
						}}
					>
						{loading ? "Loading…" : "Load more"}
					</button>
				)}
			</div>
		</div>
	);
};
