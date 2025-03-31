const handleSocketMessage = function(data)
{
    const type = data.type;

    switch (type)
    {  
        case 'paddle_position':
            const player = data.player;
            const position = data.position;

            if (player !== this.playerNumber) {
                if (player === 1)
                    this.p1.pos = position;
                else if (player === 2)
                    this.p2.pos = position;
            }
            break;
                
        case 'ball_update':
            if (this.playerNumber !== 1) {
                this.ball.pos = data.position;
                this.ball.vel_t = data.velocity;
            }
            break;

        case 'score_update':
            
            this.p1.score = data.p1_score;
            this.p2.score = data.p2_score;
            if (data.signal == 1)
                this.ft_start();
            else if (data.signal == 2)
                this.ft_stop()
            break;

        case 'game_control':
            const action = data.action;
            switch (action) {
                case 'start':
                    this.ft_start();
                    break;
                case 'pause':
                    this.ft_pause();
                    break;
                case 'stop':
                    this.ft_stop();
                    break;
            }
            break;

        case 'match_data':
            this.matchData = data.match_data;
            if (window.loggedInUserName === this.matchData.player1) {
                this.playerNumber = 1;
                this.name = this.matchData.player1;
            }
            else if (window.loggedInUserName === this.matchData.player2) {
                this.playerNumber = 2;
                this.name = this.matchData.player2;
            }
            this.points_to_win = this.matchData.points_to_win;
            this.p1.name = this.matchData.player1;
            this.p2.name = this.matchData.player2;
            console.log('matchData: ', this.matchData);

        case 'game_over':
            break;
            //window.currentMatchData = null;
            //Route.go("/play");

        default:
            console.log('Unknown message type:', type);
    }
}

const sendPaddlePosition = function(position) {
    if (!this.pongSocket || this.pongSocket.readyState !== WebSocket.OPEN) {
        console.error("Pong socket not connected");
        return;
    }

    if (!this.playerNumber) {
        console.error("Player number not assigned");
        return;
    }

    this.pongSocket.send(JSON.stringify({
        'type': 'paddle_position',
        'player': this.playerNumber,
        'position': position
    }))
}

const sendBallUpdate = function(position, velocity) {
    if (!this.pongSocket || this.pongSocket.readyState !== WebSocket.OPEN) {
        console.error("Pong socket not connected");
        return;
    }

    if (this.playerNumber !== 1)
        return;

    this.pongSocket.send(JSON.stringify({
        'type': 'ball_update',
        'position': position,
        'velocity': velocity
    }))
}

const sendScoreUpdate = function(signal, p1Score, p2Score) {
    if (!this.pongSocket || this.pongSocket.readyState !== WebSocket.OPEN) {
        console.error("Pong socket not connected");
        return;
    }

    if (this.playerNumber !== 1) {
        return;
    }

    this.pongSocket.send(JSON.stringify({
        'type': 'score_update',
        'signal': signal,
        'p1_score': p1Score,
        'p2_score': p2Score
    }))
}

const sendGameControl = function(action) {
    if (!this.pongSocket || this.pongSocket.readyState !== WebSocket.OPEN) {
        console.error("Pong socket not connected");
        return;
    }

    if (!['start', 'pause', 'stop'].includes(action)) {
        console.error("Invalid game control action: ", action);
        return;
    }

    this.pongSocket.send(JSON.stringify({
        'type': 'game_control',
        'action': action
    }))
}

const sendMatchData = function(attempts) {
    if (!this.pongSocket || this.pongSocket.readyState !== WebSocket.OPEN) {
        console.error("Pong socket not connected");
        if (attempts < 10) {
            setTimeout(() => this.sendMatchData(attempts + 1), 300)
        }
        return;
    }

    console.log('sendMatchData');

    this.pongSocket.send(JSON.stringify({
        'type': 'match_data',
        'match_data': this.matchData,
    }))
}

const sendGameOver = function() {
    if (!this.pongSocket || this.pongSocket.readyState !== WebSocket.OPEN) {
        console.error("Pong socket not connected");
        return;
    }

    if (this.playerNumber !== 1) {
        return;
    }

    let winner_name;

    if (this.p1.score == this.points_to_win)
        winner_name = this.p1.name;
    else if (this.p2.score == this.points_to_win)
        winner_name = this.p2.name;

    this.pongSocket.send(JSON.stringify({
        'type': 'game_over',
        'winner': winner_name,
        'match_id': this.matchData.matchId
    }))
}

export { handleSocketMessage, sendPaddlePosition, sendBallUpdate, sendScoreUpdate, sendGameControl, sendMatchData, sendGameOver }