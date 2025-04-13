// import { showToast } from "./toast";

let activeSocket = null;

export function getOrCreateSocket() {
  if (activeSocket && activeSocket.readyState === WebSocket.OPEN) {
    return activeSocket;
  }
  activeSocket = new WebSocket(`ws://${window.location.hostname}:8000/ws/matchmaking/`);
  activeSocket.onopen = () => console.log("Global WebSocket connected.");
  activeSocket.onclose = () => console.warn("Global WebSocket closed.");
  activeSocket.onerror = (err) => console.error("Global WebSocket error:", err);
  activeSocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.event === "match_forfeited") {
      // alert(data.message || "Opponent forfeited.");
      // showToast(data.message || "Opponent forfeited.")
      forceCloseAllModals();
      window.currentMatchData = null;
      // window.location.hash = "#/play";
      Route.go("/play")
    } else {
      console.log("Global message:", data);
    }
  };
  return activeSocket;
}

function forceCloseAllModals() {
  document.body.classList.remove("modal-open");
  document.querySelectorAll(".modal-backdrop").forEach((b) => b.remove());
}
