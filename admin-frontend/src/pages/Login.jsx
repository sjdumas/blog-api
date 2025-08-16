import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { API_BASE } from "../lib/api";
import { setAuth, clearAuth, parseJwt } from "../lib/auth";
import Button from "../components/Button";
import FormField from "../components/FormField";

export default function Login({ setIsLoggedIn }) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [err, setErr] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const redirectTo = (location.state && location.state.from) || "/";

	const onSubmit = async (e) => {
		e.preventDefault();
		setErr("");
		setLoading(true);

		try {
			const res = await fetch(`${API_BASE}/api/auth/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify({ email, password }),
			});
			const data = await res.json().catch(() => ({}));

			if (!res.ok) throw new Error(data?.error || "Login failed");

			const token = data.token;
			if (!token) throw new Error("No token in response");

			let user = data.user;
			if (!user) {
				const payload = parseJwt(token);
				user = {
					email: payload?.email || email,
					userId: payload?.userId,
					isAdmin: !!payload?.isAdmin,
				};
			}

			setAuth({ token, user });
			navigate(redirectTo, { replace: true });
		} catch (e) {
			setErr(e.message || "Login failed");
			clearAuth();
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto p-6">
			<h1 className="text-2xl text-center font-semibold mb-4">Sign In</h1>
			<p className="text-center text-gray-500 mb-4">
				Use your admin credentials to sign in.
			</p>
			<form onSubmit={onSubmit} className="space-y-4">
				<div>
					<FormField
						label=""
						name="email"
						type="email"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>

					<FormField
						label=""
						name="password"
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</div>

				{err && <p className="text-red-600 text-sm">{err}</p>}
				<Button type="submit" className="w-full">
					{loading ? "Signing in..." : "Sign In"}
				</Button>
			</form>
			<div className="mt-4 text-center">
				<Link to="/" className="text-base text-blue-600 hover:text-black">
					Return Home
				</Link>
			</div>
		</div>
	);
};
