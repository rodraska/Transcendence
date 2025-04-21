const handleSocketMessage = function(data)
{
    const type = data.type;

    switch (type)
    {  
        case 'player_disconnect':
            console.log('player_disconnect');
            this.ft_stop(4);
            break;
        case 'paddle_position':
            const player = data.player;
            const position = data.position;

            if (player === 1)
                this.p1.pos = position;
            else if (player === 2)
                this.p2.pos = position;
            break;
                
        case 'ball_update':
            this.ball.pos = data.position;
            this.ball.vel_t = data.velocity;
            break;

        case 'score_update':
            console.log('score update');
            this.p1.score = data.p1_score;
            this.p2.score = data.p2_score;
            this.p2.pos[0] = -this.width / 2 + this.p_width / 2 + this.p_offest;
            this.p2.pos[1] = 0;
            this.p1.pos[0] = this.width / 2 - this.p_width / 2 - this.p_offest;
            this.p1.pos[1] = 0;
            if (data.signal == 1)
                this.ft_start();
            else if (data.signal == 2)
                this.ft_stop()
            break;

        case 'game_control':
            console.log('receive game_control');
            const action = data.action;
            switch (action) {
                case 'start':
                    this.ft_start();
                    break;
                case 'pause':
                    this.ft_pause();
                    break;
                case 'stop':
                    this.ft_stop(data.player_number);
                    break;
            }
            break;

        case 'match_data':
            if (this.matchData) break;
            console.log('receive match data');
            this.matchData = data.match_data;
            this.setMatchData();
            break;

        case 'game_over':
            this.closePongSocket();
            break;
            //window.currentMatchData = null;
            //Route.go("/play");

        default:
            console.log('Unknown message type:', type);
    }
}

const checkSocket = function() {
    if (!this.pongSocket || this.pongSocket.readyState !== WebSocket.OPEN) {
        console.error("Pong socket not connected");
        return 0;
    }

    if (!this.playerNumber) {
        console.error("Player number not assigned");
        return 0;
    }

    return 1;
}

const setMatchData = function() {
    console.log('set match data');
    if (window.loggedInUserName === this.matchData.player1) {
        this.playerNumber = 1;
        this.name = this.matchData.player1;
    }
    else if (window.loggedInUserName === this.matchData.player2) {
        this.playerNumber = 2;
        this.name = this.matchData.player2;
    }
    this.points_to_win = this.matchData.points_to_win;
    this.powerups_enabled = this.matchData.powerups_enabled;
    if (this.powerups_enabled) this.boost = 2;
    console.log('powerups_enabled: ', this.powerups_enabled);
    this.p1.name = this.matchData.player1;
    this.p2.name = this.matchData.player2;
}

const sendPaddlePosition = function(position) {
    if (!this.checkSocket()) return;

    this.pongSocket.send(JSON.stringify({
        'type': 'paddle_position',
        'player': this.playerNumber,
        'position': position
    }))
}

const sendBallUpdate = function(position, velocity) {
    if (!this.checkSocket()) return;

    this.pongSocket.send(JSON.stringify({
        'type': 'ball_update',
        'position': position,
        'velocity': velocity
    }))
}

const sendScoreUpdate = function(signal, p1Score, p2Score) {
    if (!this.checkSocket()) return;

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

    console.log('send game control: ', this.playerNumber);

    this.pongSocket.send(JSON.stringify({
        'type': 'game_control',
        'action': action,
        'player_number': this.playerNumber
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

    this.setMatchData();

    this.pongSocket.send(JSON.stringify({
        'type': 'match_data',
        'match_data': this.matchData,
    }))
}

const sendGameOver = function() {
    if (!this.checkSocket()) return;

    console.log('send game over');

    let winner_name;

    if (this.p1.score == this.points_to_win)
        winner_name = this.p1.name;
    else if (this.p2.score == this.points_to_win)
        winner_name = this.p2.name;

    this.pongSocket.send(JSON.stringify({
        'type': 'game_over',
        'winner': winner_name,
        'match_id': this.matchData.matchId,
        'score': this.score,
    }))
}

export { handleSocketMessage, checkSocket, setMatchData, sendPaddlePosition, sendBallUpdate, sendScoreUpdate, sendGameControl, sendMatchData, sendGameOver }