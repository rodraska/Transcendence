// let socket;

// function connectWebSocket() {
//   socket = new WebSocket("ws://localhost:8000/ws/matchmaking/");

//   socket.onopen = function () {
//     console.log("Connected to WebSocket on matcmaking.");
//   };

//   socket.onmessage = function (event) {
//     const data = JSON.parse(event.data);
//     if (data.match_found) {
//       alert(`Match found! Match ID: ${data.match_id}`);
//     } else if (data.success === false) {
//       alert(`Error: ${data.message}`);
//     } else if (data.event === "match_forfeited") {
//       alert(`Opponent forfeited: ${data.message}`);
//     } else {
//       console.log("Still searching...");
//     }
//   };

//   socket.onerror = function (error) {
//     console.error("WebSocket error:", error);
//   };

//   socket.onclose = function () {
//     console.warn("WebSocket closed. Reconnecting in 5 seconds...");
//     setTimeout(connectWebSocket, 5000);
//   };
// }

// connectWebSocket();

// export function searchForMatch(gameType) {
//   if (socket.readyState === WebSocket.OPEN) {
//     socket.send(JSON.stringify({ action: "join", game_type_id: gameType }));
//   } else {
//     console.error("WebSocket is not open.");
//   }
// }

// function giveUpMatch() {
//   if (socket.readyState === WebSocket.OPEN) {
//     socket.send(JSON.stringify({ action: "forfeit" }));
//     alert("You forfeited the match.");
//   } else {
//     console.error("WebSocket is not open.");
//   }
// }
