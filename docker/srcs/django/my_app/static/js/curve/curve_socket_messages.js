const handleSocketMessage = function(data)
{
    const type = data.type;

    switch (type)
    {
        case 'player_assign':
            this.playerNumber = data.player_number;
            console.log(`Assigned as player: ${this.playerNumber}`);
            break;

        case 'game_ready':
            console.log('Game is ready to start');
            this.gameReady = true;
            break;

        case 'player_state':
            const player = data.player;
            const player_dest_id = data.player_dest_id;
            const id = player.id;

            if (player_dest_id === this.playerNumber) {
                const targetPlayer = this.players[id - 1];
                Object.assign(targetPlayer, player);
            }
            break;
        
        case 'new_power':
            const power = data.power;
            this.powers.push(new this.powerConstructors[power.id](power.id, power.pos, power.iters));
            break;

        case 'pick_power':
            const i = data.i;
            const player_id = data.player_id
            if (this.playerNumber !== player_id)
                this.powers.splice(i, 1);
            break;
        
        case 'pick_others':
            console.log('pick_others');
            const _power_id = data.power_id;
            const _player_id = data.player_id;
            if (this.playerNumber !== _player_id) {
                let power = new this.powerConstructors[_power_id](_power_id, [0, 0], this.baseIters[_power_id])
                this.players[this.playerNumber - 1].powers.push(power);
            }
            break;
                

        case 'pick_general':
            this.currentIters[10] = this.baseIters[10];
            this.erase = true;
            break;

        case 'collision':
            console.log('receive collision');
            const player_id_ = data.player_id;
            this.players[player_id_ - 1].processCollision();
            document.getElementById("score1").innerHTML = this.playerScores[1];
            document.getElementById("score2").innerHTML = this.playerScores[2];
            break;

        case 'game_control':
            const action = data.action;
            switch (action) {
                case 'start':
                    this.ft_start(false);
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
            if (window.loggedInUserName === this.matchData.player1)
                this.playerNumber = 1;
            else if (window.loggedInUserName === this.matchData.player2)
                this.playerNumber = 2;
            this.getElementById("name1").innerHTML = this.matchData.player1;
            this.getElementById("name2").innerHTML = this.matchData.player2;
            this.getElementById("pointToWin").innerHTML = "Point to Win: " + this.matchData.points_to_win;
            console.log('matchData: ', this.matchData);
            
        default:
            console.log('Unkown message type:', type);
    }
}

const sendPlayerState = function(player_src, player_dest_id) {
    if (!this.curveSocket || this.curveSocket.readyState !== WebSocket.OPEN) {
        console.error("Curve socket not connected");
        return;
    }

    if (!this.playerNumber) {
        console.error("Player number not assigned");
        return;
    }

    const playerProperties = {
        id: player_src.id,
        pos: player_src.pos,
        truepos: player_src.truepos,
        back: player_src.back,
        mid: player_src.mid,
        powers: player_src.powers,
        vel: player_src.vel,
        hole_iter: player_src.hole_iter,
        turning: player_src.turning,
        god: player_src.god,
        stop: player_src.stop,
        theta: player_src.theta,
        trig: player_src.trig,
        vel_t: player_src.vel_t,
        radius: player_src.radius,
        turn_rate: player_src.turn_rate,
        hole_rate: player_src.hole_rate
    }

    this.curveSocket.send(JSON.stringify({
        'type': 'player_state',
        'player': playerProperties,
        'player_dest_id': player_dest_id

    }))
}

const sendNewPower = function(power) {
    if (!this.curveSocket || this.curveSocket.readyState !== WebSocket.OPEN) {
        console.error("Curve socket not connected");
        return;
    }

    if (!this.playerNumber) {
        console.error("Player number not assigned");
        return;
    }

    const powerProperties = {
        id: power.id,
        pos: power.pos,
        iters: power.iters
    }

    this.curveSocket.send(JSON.stringify({
        'type': 'new_power',
        'power': powerProperties
    }))
}

const sendPickPower = function(i, player_id) {
    if (!this.curveSocket || this.curveSocket.readyState !== WebSocket.OPEN) {
        console.error("Curve socket not connected");
        return;
    }

    if (!this.playerNumber) {
        console.error("Player number not assigned");
        return;
    }

    this.curveSocket.send(JSON.stringify({
        'type': 'pick_power',
        'i': i,
        'player_id': player_id
    }))
}

const sendPickOthers = function(power_id, player_id) {
    if (!this.curveSocket || this.curveSocket.readyState !== WebSocket.OPEN) {
        console.error("Curve socket not connected");
        return;
    }

    if (!this.playerNumber) {
        console.error("Player number not assigned");
        return;
    }

    this.curveSocket.send(JSON.stringify({
        'type': 'pick_others',
        'power_id': power_id,
        'player_id': player_id
    }))
}

const sendPickGeneral = function() {
    if (!this.curveSocket || this.curveSocket.readyState !== WebSocket.OPEN) {
        console.error("Curve socket not connected");
        return;
    }

    if (!this.playerNumber) {
        console.error("Player number not assigned");
        return;
    }

    this.curveSocket.send(JSON.stringify({
        'type': 'pick_general'
    }))
}

const sendCollision = function(player_id) {
    if (!this.curveSocket || this.curveSocket.readyState !== WebSocket.OPEN) {
        console.error("Curve socket not connected");
        return;
    }

    if (!this.playerNumber) {
        console.error("Player number not assigned");
        return;
    }

    console.log('sendCollision');

    this.curveSocket.send(JSON.stringify({
        'type': 'collision',
        'player_id': player_id
    }))
}

const sendGameControl = function(action) {
    if (!this.curveSocket || this.curveSocket.readyState !== WebSocket.OPEN) {
        console.error("Curve socket not connected");
        return;
    }

    if (!['start', 'pause', 'stop'].includes(action)) {
        console.error("Invalid game control action: ", action);
        return;
    }

    this.curveSocket.send(JSON.stringify({
        'type': 'game_control',
        'action': action
    }))
}

const sendMatchData = function(attempts) {
    if (!this.curveSocket || this.curveSocket.readyState !== WebSocket.OPEN) {
        console.error("Curve socket not connected");
        if (attempts < 10) {
            setTimeout(() => this.sendMatchData(attempts + 1), 300)
        }
        return;
    }

    console.log('sendMatchData');

    this.curveSocket.send(JSON.stringify({
        'type': 'match_data',
        'match_data': this.matchData,
    }))
}

export { handleSocketMessage, sendPlayerState, sendNewPower, sendPickPower, sendPickOthers, sendPickGeneral, sendCollision, sendGameControl, sendMatchData }