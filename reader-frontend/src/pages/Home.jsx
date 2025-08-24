import { useEffect, useState } from "react";
import PostList from "../components/PostList";

const PAGE_SIZE = 10;

export default function Home() {
	const [posts, setPosts] = useState([]);
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const avatarUrl = "/avatar.png" // place avatar img in the project's public/ folder
	const [imgError, setImgError] = useState(false);

	// Fallback initials shown if the image fails to load
	const initials = "SJD";

	useEffect(() => {
		let cancelled = false;

		const fetchPosts = async () => {
			setLoading(true);
			setError("");
			try {
				const res = await fetch(`/api/posts/public?page=${page}&pageSize=${PAGE_SIZE}`);
				if (!res.ok) {
					const err = await res.json().catch(() => ({}));
					throw new Error(err?.error || `Failed to load posts (status ${res.status})`);
				}
				const json = await res.json();
				if (cancelled) return;
				setPosts((prev) => (page === 1 ? json.data : [...prev, ...json.data]));
				setTotal(json.total ?? 0);
			} catch (e) {
				if (!cancelled) setError(e.message || "Failed to load posts.");
			} finally {
				if (!cancelled) setLoading(false);
			}
		};

		fetchPosts();
		return () => {
			cancelled = true;
		};
	}, [page]);

	return (
		<div className="space-y-8">
			{/* hero */}
			<section className="hero">
				{/* hero avatar */}
				<section className="avatar">
					<div className="flex items-start gap-5">
						{/* Avatar */}
						<div className="shrink-0">
							{!imgError ? (
								<img
									src={avatarUrl}
									alt="Portrait"
									className="h-30 w-30 rounded-full object-cover"
									width={96}
									height={96}
									loading="lazy"
									onError={() => setImgError(true)}
								/>
							) : (
								<div className="h-30 w-30 rounded-full bg-slate-200 ring-1 ring-slate-200 grid place-items-center">
									<span className="text-lg font-semibold text-slate-700">
										{initials}
									</span>
								</div>
							)}
						</div>

						{/* Intro */}
						<div className="flex-1">
							<h1 className="text-3xl font-bold">Hello</h1>
							<p>
								Hello and welcome. This is the place where I share lessons learned
								while coding, thoughts on tech trends, and any other fascinating
								information that I might want to write about — tech related or not.
							</p>
						</div>
					</div>
				</section>
			</section>

			{/* states + posts list */}
			<section className="posts">
				<h2 className="text-2xl mb-4">Latest Posts</h2>
				{error && (
					<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
						{error}
					</div>
				)}
				
				{loading && posts.length === 0 && (
					<div className="grid gap-4">
						{[...Array(3)].map((_, i) => (
							<div key={i}>
								<div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
								<div className="mt-3 h-3 w-1/3 animate-pulse rounded bg-slate-200" />
								<div className="mt-4 space-y-2">
									<div className="h-3 w-full animate-pulse rounded bg-slate-200" />
									<div className="h-3 w-5/6 animate-pulse rounded bg-slate-200" />
									<div className="h-3 w-4/6 animate-pulse rounded bg-slate-200" />
								</div>
							</div>
						))}
					</div>
				)}

				{!loading && !error && posts.length === 0 && (
					<div className="rounded-xl border bg-white p-8 text-center text-slate-600">
						No posts yet.
					</div>
				)}

				{posts.length > 0 && <PostList posts={posts} />}

				{/* load more */}
				{posts.length < total && (
					<div className="pt-2 text-center">
						<button
							onClick={() => setPage((p) => p + 1)}
							disabled={loading}
							className="inline-flex items-center rounded-xl border bg-white px-4 py-2 text-sm font-medium shadow-sm hover:shadow transition disabled:opacity-60"
						>
							{loading ? "Loading…" : "Load more"}
						</button>
					</div>
				)}
			</section>
		</div>
	);
};
