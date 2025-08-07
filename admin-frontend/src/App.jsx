import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NewPost from "./pages/NewPost";
import EditPost from "./pages/EditPost";
import UserComments from "./pages/UserComments";
import AdminComments from "./pages/AdminComments";

function App() {
	return (
		<Router>
			<Navbar />
			<main className="p-4">
				<Routes>
					<Route path="/" element={<Dashboard />} />
					<Route path="/login" element={<Login />} />
					<Route path="/posts/new" element={<NewPost />} />
					<Route path="/posts/:id/edit" element={<EditPost />} />
					<Route path="/comments" element={<UserComments />} />
					<Route path="/admin/comments" element={<AdminComments />} />
				</Routes>
			</main>
		</Router>
	);
};

export default App;
