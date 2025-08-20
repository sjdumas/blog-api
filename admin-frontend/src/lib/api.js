import { authHeaders, clearAuth } from "./auth";

export const API_BASE =
	import.meta?.env?.VITE_API_URL ||
	(typeof process !== "undefined" && process?.env?.REACT_APP_API_URL) ||
	"";

/**
 * Public fetch: no auth injection. Throws an Error on failure.
 */
export async function apiFetch(path, options = {}) {
	const res = await fetch(`${API_BASE}${path}`, options);
	const data = await res.json().catch(() => ({}));

	if (!res.ok) {
		throw {
			message: data?.error || `Request failed (${res.status})`,
			status: res.status,
			details: data?.details,
		};
	}
	return data;
};

/**
 * Authenticated fetch: injects Authorization + handles 401 + exposes per-field backend errors.
 * Throws: { message, status, details }
 */
export async function authFetch(path, options = {}) {
	const res = await fetch(`${API_BASE}${path}`, {
		...options,
		headers: authHeaders(options.headers || {}),
	});

	if (res.status === 401) {
		clearAuth();
		window.location.assign("/login");
		
		return new Promise(() => { });
	}

	const data = await res.json().catch(() => ({}));

	if (!res.ok) {
		throw {
			message: data?.error || `Request failed (${res.status})`,
			status: res.status,
			details: data?.details,
		};
	}
	return data;
};
