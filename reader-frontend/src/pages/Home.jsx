import { useEffect, useState } from "react";
import PostList from "../components/PostList";

export default function Home() {
	const [posts, setPosts] = useState([]);
	const [error, setError] = useState("");

	useEffect(() => {
	fetch("http://localhost:3000/api/posts")
		.then((res) => {
			if (!res.ok) throw new Error("Failed to fetch posts");
				return res.json();
			})
		.then((data) => {
		setPosts(data);
		setError("");
		})
		.catch((err) => setError(err.message));
	}, []);

	return (
		<div>
			<h1>Blog Posts</h1>
			{error && <p style={{ color: "red" }}>{error}</p>}
			<PostList posts={posts} />
		</div>
	);
};
