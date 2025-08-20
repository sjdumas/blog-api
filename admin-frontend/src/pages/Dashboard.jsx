import { useEffect, useState } from "react";
import { API_BASE, authFetch } from "../lib/api";
import DashboardStat from "../components/DashboardStat";
import PostsTable from "../components/PostsTable";

export default function Dashboard() {
	const [stats, setStats] = useState({
		totalPosts: 0,
		draftPosts: 0,
		publishedPosts: 0,
		totalComments: 0,
	});

	useEffect(() => {
		let isMounted = true;

		async function fetchCounts() {
			try {
				const [postStats, commentStats] = await Promise.all([
					authFetch(`${API_BASE}/api/posts/stats`),
					authFetch(`${API_BASE}/api/comments/stats`),
				]);

				if (isMounted) {
					setStats({
						totalPosts: postStats?.total ?? 0,
						draftPosts: postStats?.draft ?? 0,
						publishedPosts: postStats?.published ?? 0,
						totalComments: commentStats?.total ?? 0,
					});
				}
			} catch (error) {
				console.error("Failed to fetch dashboard stats:", error);
				// Render anyway with defaults
			}
		}

		fetchCounts();

		return () => {
			isMounted = false;
		};
	}, []);

	return (
		<div className="p-4 space-y-6">
			<h1 className="text-2xl mb-6">Dashboard</h1>
			<div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
				<DashboardStat title="Total Posts" value={stats.totalPosts} />
				<DashboardStat title="Draft Posts" value={stats.draftPosts} />
				<DashboardStat title="Published Posts" value={stats.publishedPosts} />
				<DashboardStat title="Total Comments" value={stats.totalComments} />
			</div>
			<section className="mt-8">
				<PostsTable />
			</section>
		</div>
	);
};
