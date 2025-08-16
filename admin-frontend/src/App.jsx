import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import StartPage from "./pages/StartPage";
import NewPost from "./pages/NewPost";
import EditPost from "./pages/EditPost";
import UserComments from "./pages/UserComments";
import AdminComments from "./pages/AdminComments";
import AdminPosts from "./pages/AdminPosts";
import AdminGuard from "./pages/AdminGuard";
import Footer from "./components/Footer";
import { getUser } from "./lib/auth";

const HomeSwitch = () => {
	const user = getUser();
	if (user?.isAdmin) {
		return (
			<AdminGuard>
				<Dashboard />
			</AdminGuard>
		);
	}
	return <StartPage />;
};

// Using a wrapper to get access to location in App
function AppRoutes() {
	const location = useLocation();

	useEffect(() => {
		switch (location.pathname) {
			case "/":
				document.title = "Welcome | Blog";
				break;
			case "/login":
				document.title = "Login | Admin";
				break;
			case "/dashboard":
				document.title = "Dashboard | Admin";
				break;
			case "/posts/new":
				document.title = "New Post | Admin";
				break;
			case "/admin/posts":
				document.title = "All Posts | Admin";
				break;
			case "/admin/comments":
				document.title = "Comments | Admin";
				break;
			default:
				document.title = "Admin Panel";
		}
	}, [location.pathname]);

	return (
		<div className="min-h-screen flex flex-col">
			<header className="border-b bg-white">
				<Navbar />
			</header>

			<main className="flex-1 p-4">
				<Routes>
					<Route
						path="/"
						element={<HomeSwitch key={location.pathname} />} // 👈 remounts on path change
					/>

					<Route path="/login" element={<Login />} />

					<Route
						path="/posts/new"
						element={
							<AdminGuard>
								<NewPost />
							</AdminGuard>
						}
					/>
					<Route
						path="/posts/:id/edit"
						element={
							<AdminGuard>
								<EditPost />
							</AdminGuard>
						}
					/>
					<Route
						path="/comments"
						element={
							<AdminGuard>
								<UserComments />
							</AdminGuard>
						}
					/>
					<Route
						path="/admin/comments"
						element={
							<AdminGuard>
								<AdminComments />
							</AdminGuard>
						}
					/>
					<Route
						path="/admin/posts"
						element={
							<AdminGuard>
								<AdminPosts />
							</AdminGuard>
						}
					/>
					<Route
						path="/dashboard"
						element={<HomeSwitch key={location.pathname} />}
					/>
				</Routes>
			</main>
			<Footer />
		</div>
	);
};

export default function App() {
	return (
		<Router>
			<AppRoutes />
		</Router>
	);
};
