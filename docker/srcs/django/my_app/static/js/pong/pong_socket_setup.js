const setupPongSocket = function()
{
    const self = this;

    const matchId = this.matchData.matchId;
    const pongSocket = new WebSocket(`ws://${window.location.hostname}:8000/ws/pong_game/${matchId}/`);
    this.pongSocket = pongSocket;

    pongSocket.onopen = function() {
        console.log("Pong socket open");
    };
    
    pongSocket.onerror = function(e) {
        console.error('Pong socket error:', e)
    };

    pongSocket.onclose = function(e) {
        console.log('Pong socket closed:', e.code, e.reason)
    };

    pongSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        //console.log("Pong socket onmessage:", data);
        self.handleSocketMessage(data);
    };
}

export { setupPongSocket }