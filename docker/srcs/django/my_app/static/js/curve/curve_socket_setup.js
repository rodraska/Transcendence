const setupCurveSocket =function()
{
    const self = this;

    const matchId = this.matchData.matchId;
    const curveSocket = new WebSocket(`ws://localhost:8000/ws/curve_game/${matchId}/`);
    this.curveSocket = curveSocket;
    window.curveSocket = curveSocket;

    curveSocket.onopen = function() {
        console.log('Curve socket onopen');
    }

    curveSocket.onerror = function(e) {
        console.error('Curve socket error:', e);
    }

    curveSocket.onclose = function(e) {
        console.log('Curve socket closed:', e.code, e.reason);
    }

    curveSocket.onmessage = function(e)
    {
        const data = JSON.parse(e.data);
        //console.log("Curve socket onmessage:", data);
        self.handleSocketMessage(data);
    }
}

const closeCurveSocket = function() {
    if (this.curveSocket && this.curveSocket.readyState !== WebSocket.CLOSED) {
        this.curveSocket.close();
        console.log('Curve socket closing...');
    }
    else
        console.log('Curve socket already closed or never opened');

    this.curveSocket = null;
    window.curveSocket = null;
}

export { setupCurveSocket, closeCurveSocket }