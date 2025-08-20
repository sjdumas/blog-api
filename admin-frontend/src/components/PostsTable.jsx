import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { API_BASE } from "../lib/api";
import { authHeaders, clearAuth } from "../lib/auth";
import { Link } from "react-router-dom";
import FormField from "./FormField";
import Button from "./Button";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function useDebounced(value, delay = 400) {
	const [v, setV] = useState(value);
	useEffect(() => {
		const t = setTimeout(() => setV(value), delay);
		return () => clearTimeout(t);
	}, [value, delay]);
	return v;
}

function formatDate(d) {
	if (!d) return "—";
	const date = new Date(d);
	return date.toLocaleString();
}

/**
 * Props:
 *  limit?: number | null     -> (show only first N rows)
 *  showFilters?: boolean     -> default true
 *  showPagination?: boolean  -> default true
 */
export default function PostsTable({
	limit = null,
	showFilters = true,
	showPagination = true,
}) {
	const [posts, setPosts] = useState([]);
	const [total, setTotal] = useState(0);

	const [q, setQ] = useState("");
	const debouncedQ = useDebounced(q);
	const [status, setStatus] = useState("ALL"); // ALL | DRAFT | PUBLISHED
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [loading, setLoading] = useState(false);

	const queryString = useMemo(() => {
		const params = new URLSearchParams();
		if (debouncedQ) params.set("q", debouncedQ);
		if (status !== "ALL") params.set("status", status);
		params.set("page", String(page));
		params.set("pageSize", String(pageSize));
		return params.toString();
	}, [debouncedQ, status, page, pageSize]);

	useEffect(() => {
		const controller = new AbortController();
		async function fetchPosts() {
			setLoading(true);
			try {
				const res = await fetch(`${API_BASE}/api/posts/manage?${queryString}`, {
					headers: authHeaders(),
					signal: controller.signal,
				});
				if (res.status === 401) {
					clearAuth();
					window.location.assign("/login");
					return;
				}
				const json = await res.json().catch(() => ({}));
				if (!res.ok) throw new Error(json?.error || `Failed to fetch posts (${res.status})`);

				setPosts(Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : []);
				setTotal(json.total ?? (Array.isArray(json.data) ? json.data.length : 0));
			} catch (error) {
				if (error.name !== "AbortError") {
					console.error(error);
					toast.error(error.message || "Failed to load posts");
				}
			} finally {
				setLoading(false);
			}
		}
		fetchPosts();
		return () => controller.abort();
	}, [queryString]);

	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	const publish = async (id) => {
		const tId = toast.loading("Publishing…");
		try {
			const res = await fetch(`${API_BASE}/api/posts/${id}/publish`, {
				method: "PUT",
				headers: authHeaders({ "Content-Type": "application/json" }),
			});
			if (!res.ok) throw new Error("Failed to publish");
			setPosts((prev) =>
				prev.map((p) => (p.id === id ? { ...p, status: "PUBLISHED", publishedAt: new Date().toISOString() } : p))
			);
			toast.success("Post published", { id: tId });
		} catch (error) {
			toast.error(error.message || "Could not publish", { id: tId });
		}
	};

	const unpublish = async (id) => {
		const tId = toast.loading("Unpublishing…");
		try {
			const res = await fetch(`${API_BASE}/api/posts/${id}/unpublish`, {
				method: "PUT",
				headers: authHeaders({ "Content-Type": "application/json" }),
			});
			if (!res.ok) throw new Error("Failed to unpublish");
			setPosts((prev) =>
				prev.map((p) => (p.id === id ? { ...p, status: "DRAFT", publishedAt: null } : p))
			);
			toast.success("Post unpublished", { id: tId });
		} catch (error) {
			toast.error(error.message || "Could not unpublish", { id: tId });
		}
	};

	const deletePost = async (id) => {
		if (!window.confirm("Are you sure you want to delete this post?")) return;
		const tId = toast.loading("Deleting…");
		try {
			const res = await fetch(`${API_BASE}/api/posts/${id}`, {
				method: "DELETE",
				headers: authHeaders(),
			});
			if (!res.ok) throw new Error("Failed to delete");
			setPosts((prev) => prev.filter((p) => p.id !== id));
			toast.success("Post deleted", { id: tId });
		} catch (error) {
			toast.error(error.message || "Could not delete", { id: tId });
		}
	};

	const filteredRows = limit ? posts.slice(0, limit) : posts;

	return (
		<div className="space-y-4">
			{showFilters && (
				<header className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
					<div className="space-y-2">
						<h2 className="text-xl font-semibold">Posts</h2>
						<p className="text-sm text-gray-500">{total} total</p>
					</div>
					<div className="flex flex-col sm:flex-row gap-3">
						<FormField name="search" value={q} placeholder="Search title/content…" onChange={(e) => setQ(e.target.value)} />
						<FormField
							name="status"
							as="select"
							value={status}
							onChange={(e) => {
								setStatus(e.target.value);
								setPage(1);
							}}
							options={[
								{ value: "ALL", label: "All" },
								{ value: "DRAFT", label: "Draft" },
								{ value: "PUBLISHED", label: "Published" },
							]}
						/>
						<FormField
							name="pageSize"
							as="select"
							value={pageSize}
							onChange={(e) => {
								setPageSize(Number(e.target.value));
								setPage(1);
							}}
							options={PAGE_SIZE_OPTIONS.map((n) => ({ value: n, label: `${n} / page` }))}
						/>
					</div>
				</header>
			)}

			<div className="overflow-x-auto rounded border border-gray-300">
				<table className="min-w-full text-sm">
					<thead className="bg-gray-50">
						<tr className="text-left">
							<th className="p-3">Title</th>
							<th className="p-3">Status</th>
							<th className="p-3">Author</th>
							<th className="p-3">Created</th>
							<th className="p-3">Published</th>
							<th className="p-3 text-right">Actions</th>
						</tr>
					</thead>
					<tbody>
						{loading && (
							<tr>
								<td colSpan={6} className="p-3 italic text-gray-500">
									Loading…
								</td>
							</tr>
						)}
						{!loading && filteredRows.length === 0 && (
							<tr>
								<td colSpan={6} className="p-3 italic text-gray-500">
									No posts found.
								</td>
							</tr>
						)}
						{!loading &&
							filteredRows.map((p) => (
								<tr key={p.id} className="border-t border-t-gray-300">
									<td className="p-3">
										<div className="font-medium">{p.title}</div>
										<div className="text-xs text-gray-500 truncate max-w-[28rem]">{p.slug}</div>
									</td>
									<td className="p-3">
										<span className={`px-2 py-1 rounded-full text-xs ${p.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
											{p.status}
										</span>
									</td>
									<td className="p-3">{p.author?.username ?? "—"}</td>
									<td className="p-3">{formatDate(p.createdAt)}</td>
									<td className="p-3">{formatDate(p.publishedAt)}</td>
									<td className="p-3 whitespace-nowrap">
										<div className="flex justify-end gap-2">
											{p.status === "DRAFT" ? (
												<Button onClick={() => publish(p.id)} buttonType="small">
													Publish
												</Button>
											) : (
												<Button variant="outline" onClick={() => unpublish(p.id)} buttonType="small">
													Unpublish
												</Button>
											)}
											<Link to={`/posts/${p.id}/edit`} className="px-3 py-1 rounded focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed !mt-0 bg-white border border-black text-black hover:bg-black hover:text-white font-semibold">
												Edit
											</Link>
											<Button variant="warning" buttonType="small" onClick={() => deletePost(p.id)}>
												Delete
											</Button>
										</div>
									</td>
								</tr>
							))}
					</tbody>
				</table>
			</div>

			{showPagination && (
				<div className="flex items-center justify-between">
					<div className="text-xs text-gray-500">
						Page {page} of {Math.max(1, Math.ceil(total / pageSize))}
					</div>
					<div className="flex gap-2">
						<Button variant="outline" buttonType="small" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
							Prev
						</Button>
						<Button
							variant="outline"
							buttonType="small"
							disabled={page >= Math.ceil(total / pageSize)}
							onClick={() => setPage((p) => Math.min(Math.ceil(total / pageSize), p + 1))}
						>
							Next
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};
