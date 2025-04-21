const setupPongSocket = function()
{
    const self = this;

    const matchId = this.matchData.matchId;
    const pongSocket = new WebSocket(`wss://${window.location.hostname}/ws/pong_game/${matchId}/`);
    this.pongSocket = pongSocket;
    window.pongSocket = pongSocket;

    pongSocket.onopen = function() {
        console.log("Pong socket open");
    };
    
    pongSocket.onerror = function(e) {
        console.error('Pong socket error:', e)
    };

    pongSocket.onclose = function(e) {
        console.log('Pong socket closed:', e.code, e.reason);
    };

    pongSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        //console.log("Pong socket onmessage:", data);
        self.handleSocketMessage(data);
    };
    window.addEventListener("offline", (event) => {
        console.log("browser offline");
        self.ft_stop(4);
        setTimeout(() => {
            pongSocket.close();
        }, 1000); // 10ms delay
    });
}


const closePongSocket = function() {
    if (this.pongSocket && this.pongSocket.readyState !== WebSocket.CLOSED) {
        this.pongSocket.close();
        console.log('Pong socket closing...');
    }
    else
        console.log('Pong socket already closed or never opened');

    this.pongSocket = null;
    window.pongSocket = null;
}

export { setupPongSocket, closePongSocket }