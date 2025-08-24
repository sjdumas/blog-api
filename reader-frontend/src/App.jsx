import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PostDetail from "./pages/PostDetail";
import About from "./pages/About";
import Layout from "./components/Layout";

export default function App() {
	return (
		<Layout>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/posts/:slug" element={<PostDetail />} />
				<Route path="/about" element={<About />} />
			</Routes>
		</Layout>
	);
};
