import { useAuth } from "./AuthContext";

export async function getValidAccessToken(logoutCallback) {
	const res = await fetch("http://localhost:8000/api/token/refresh/", {
		method: "POST",
		credentials: "include",
	});

	if (res.ok) {
		return true;
	} else {
		const response = await fetch("http://localhost:8000/api/logout/", {
			method: "POST",
			credentials: "include",
		});

		logoutCallback();
		return false;
	}
}
