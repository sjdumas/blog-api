import { Link } from "react-router-dom";

export default function PostList({ posts }) {
	if (!posts.length) return <p>No posts found.</p>;

	return (
		<ul>
			{posts.map((post) =>(
				<li key={post.id} style={{ marginBottom: "1.5rem" }}>
					<h2>{post.title}</h2>
					<p>{post.excerpt}</p>
					<Link to={`/posts/${post.slug}`}>{post.title}</Link>
				</li>
			))}
		</ul>
	);
};
