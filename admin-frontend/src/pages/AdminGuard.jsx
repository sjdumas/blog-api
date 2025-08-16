import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getToken, parseJwt, clearAuth } from "../lib/auth";

export default function AdminGuard({ children }) {
	const [status, setStatus] = useState("checking");
	const location = useLocation();

	useEffect(() => {
		try {
			const token = getToken();
			if (!token) {
				setStatus("rejected");
				return;
			}

			const payload = parseJwt(token);

			if (payload?.exp && Date.now() / 1000 >= payload.exp) {
				clearAuth();
				setStatus("rejected");
				return;
			}

			if (!payload?.isAdmin) {
				setStatus("notAdmin");
				return;
			}

			setStatus("allowed");
		} catch {
			clearAuth();
			setStatus("rejected");
		}
	}, []); // IMPORTANT: run only once

	if (status === "checking") return null;
	if (status === "rejected") {
		return <Navigate to="/login" replace state={{ from: location.pathname }} />;
	}
	if (status === "notAdmin") {
		return <Navigate to="/" replace />;
	}
	return children;
};
