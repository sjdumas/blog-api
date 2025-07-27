import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PostDetail from "./pages/PostDetail";

function App() {
	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/posts/:slug" element={<PostDetail />} />
		</Routes>
	)
}

export default App;
