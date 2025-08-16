import PostsTable from "../components/PostsTable";

export default function AdminPosts() {
	// You can pass nothing and it will show full table with filters + pagination
	return (
		<div className="p-4">
			<PostsTable showFilters={true} showPagination={true} />
		</div>
	);
};
