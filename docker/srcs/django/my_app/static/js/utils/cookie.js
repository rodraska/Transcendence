/* export function getCookie(name) {
	let cookieValue = null;
	if (document.cookie && document.cookie !== "") {
		const cookies = document.cookie.split(";");
		for (let cookie of cookies) {
			const trimmed = cookie.trim();
			if (trimmed.startsWith(name + "=")) {
				cookieValue = decodeURIComponent(trimmed.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
} */


export function getCookie(name) {
	let cookieValue = null;
	if (document.cookie && document.cookie !== "") {
		const cookies = document.cookie.split(";");
		for (let cookie of cookies) {
			const trimmed = cookie.trim();
			if (trimmed.startsWith(name + "=")) {
				cookieValue = decodeURIComponent(trimmed.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}