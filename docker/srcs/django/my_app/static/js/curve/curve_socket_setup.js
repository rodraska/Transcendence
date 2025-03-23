const setupCurveSocket =function()
{
    const self = this;

    const curveSocket = new WebSocket(`ws://localhost:8000/ws/curve_game/`);
    this.curveSocket = curveSocket;

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

export { setupCurveSocket }