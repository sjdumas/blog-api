import { Link } from "react-router-dom";

export default function PostList({ posts }) {
	if (!posts.length) return <p>No posts found.</p>;

	return (
		<ul>
			{posts.map((post) =>(
				<li key={post.id}>
					<h2>
						<Link to={`/posts/${post.slug}`}>{post.title}</Link>
					</h2>
					<p>{post.excerpt}</p>
				</li>
			))}
		</ul>
	);
};
