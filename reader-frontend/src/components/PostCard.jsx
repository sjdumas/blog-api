import { Link } from "react-router-dom";

export default function PostCard({ post }) {
	const dateStr = post.publishedAt || post.createdAt;
	return (
		<article className="group rounded-2xl border bg-white shadow-sm hover:shadow-md transition overflow-hidden">
			<div className="p-5">
				<h2 className="text-lg font-semibold tracking-tight">
					<Link to={`/posts/${post.slug}`} className="hover:underline">
						{post.title}
					</Link>
				</h2>
				<p className="mt-1 text-xs text-slate-500">
					{post.author?.username ? `By ${post.author.username} · ` : ""}
					{new Date(dateStr).toLocaleDateString()}
				</p>
				{post.excerpt && (
					<p className="mt-3 text-sm text-slate-700 line-clamp-3">
						{post.excerpt}
					</p>
				)}
				<div className="mt-4">
					<Link
						to={`/posts/${post.slug}`}
						className="inline-flex items-center text-sm font-medium text-slate-900 hover:opacity-80"
					>
						Read more →
					</Link>
				</div>
			</div>
		</article>
	);
};
