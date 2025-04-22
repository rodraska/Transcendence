const setupCurveSocket =function()
{
    const self = this;

    const matchId = this.matchData.matchId;
    const curveSocket = new WebSocket(`wss://${window.location.hostname}/ws/curve_game/${matchId}/`);
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
        try {
            const data = JSON.parse(e.data);
            self.handleSocketMessage(data);
        }
        catch (error) {
            console.log("error socket closing");
            //curveSocket.close();
            setTimeout(() => {
                self.ft_stop(4);
            }, 1000);
            setTimeout(() => {
                curveSocket.close();
            }, 1000);
        }
        
    }
    window.addEventListener("offline", (event) => {
        console.log("browser offline");
        self.ft_stop(4);
        setTimeout(() => {
            curveSocket.close();
        }, 1000);
    });
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