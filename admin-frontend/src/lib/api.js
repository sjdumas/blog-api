import { clearAuth } from "./auth";

// Base URL for your backend API
export const API_BASE =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

/**
 * Wrapper around fetch to include auth token and timeout
 */
export async function authFetch(endpoint, options = {}) {
	const token = localStorage.getItem("token");

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 8000); // abort after 8s

	const config = {
		...options,
		headers: {
			"Content-Type": "application/json",
			...(token && { Authorization: `Bearer ${token}` }),
			...(options.headers || {}),
		},
		signal: controller.signal,
	};

	try {
		// Allow absolute URLs or relative endpoints
		const url = endpoint.startsWith("http")
			? endpoint
			: `${API_BASE}${endpoint}`;

		const res = await fetch(url, config);
		clearTimeout(timeoutId);

		if (!res.ok) {
			// Automatically logout on invalid token / expired login
			if (res.status === 401) {
				clearAuth();
				window.location.href = "/login";
				return;
			}
			throw new Error(`Request failed with status ${res.status}`);
		}

		return await res.json();
	} catch (error) {
		console.error("authFetch error:", error.message);
		throw error;
	}
};
