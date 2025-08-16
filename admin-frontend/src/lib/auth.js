export const STORAGE_TOKEN_KEY = "token";
export const STORAGE_USER_KEY = "user";

export const getToken = () => {
	const raw = localStorage.getItem(STORAGE_TOKEN_KEY);
	if (!raw) return null;
	// strip accidental quotes if someone JSON.stringified the token
	return raw.replace(/^"|"$/g, "").trim();
};

export const setAuth = ({ token, user }) => {
	if (token) localStorage.setItem(STORAGE_TOKEN_KEY, token);
	if (user) localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
};

export const clearAuth = () => {
	localStorage.removeItem(STORAGE_TOKEN_KEY);
	localStorage.removeItem(STORAGE_USER_KEY);
};

export const getUser = () => {
	try {
		const s = localStorage.getItem(STORAGE_USER_KEY);
		
		return s ? JSON.parse(s) : null;
	} catch {
		return null;
	}
};

export const parseJwt = (token) => {
	try {
		const base64 = token.split(".")[1];
		const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
		const payload = JSON.parse(decodeURIComponent(escape(json)));

		return payload;
	} catch {
		return {};
	}
};

export const authHeaders = (extra = {}) => {
	const t = getToken();

	return {
		Accept: "application/json",
		...(extra || {}),
		...(t ? { Authorization: `Bearer ${t}` } : {}),
	};
};
