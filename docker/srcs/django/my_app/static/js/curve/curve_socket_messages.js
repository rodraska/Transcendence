const handleSocketMessage = function(data)
{
    const type = data.type;

    switch (type)
    {
        case 'player_state':
            const player = data.player;
            if (player.id !== this.playerNumber) {
                const targetPlayer = this.players[player.id - 1];
                Object.assign(targetPlayer, player);
            }
            break;
        
        case 'new_power':
            const power = data.power;
            this.powers.push(new this.powerConstructors[power.id](power.id, power.pos, power.iters));
            break;

        case 'pick_power':
            if (this.playerNumber !== data.player_id)
                this.powers.splice(data.i, 1);
            break;
        
        case 'pick_others':
            const power_id = data.power_id;
            if (this.playerNumber !== data.player_id && this.myPlayer.stop == false) {
                let power = new this.powerConstructors[power_id](power_id, [0, 0], this.baseIters[power_id])
                this.myPlayer.powers.push(power);
            }
            break;
                

        case 'pick_general':
            this.currentIters[10] = this.baseIters[10];
            this.erase = true;
            break;

        case 'collision':
            console.log('receive collision');
            this.players[data.player_id - 1].processCollision();
            break;

        case 'game_control':
            switch (data.action) {
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
            if (window.loggedInUserName === this.matchData.player1) {
                this.playerNumber = 1;
                this.name = this.matchData.player1;
            }
            else if (window.loggedInUserName === this.matchData.player2) {
                this.playerNumber = 2;
                this.name = this.matchData.player2;
            }
            this.myPlayer = this.players[this.playerNumber - 1];
            this.points_to_win = this.matchData.points_to_win;
            this.getElementById("name1").innerHTML = this.matchData.player1;
            this.getElementById("name2").innerHTML = this.matchData.player2;
            this.getElementById("pointToWin").innerHTML = "Point to Win: " + this.points_to_win;
            console.log('matchData: ', this.matchData);
            
        default:
            console.log('Unkown message type:', type);
    }
}

const sendPlayerState = function(player) {
    if (!this.curveSocket || this.curveSocket.readyState !== WebSocket.OPEN) {
        console.error("Curve socket not connected");
        return;
    }

    if (!this.playerNumber) {
        console.error("Player number not assigned");
        return;
    }

    const playerProperties = {
        id: player.id,
        name: player.name,
        pos: player.pos,
        truepos: player.truepos,
        back: player.back,
        mid: player.mid,
        powers: player.powers,
        vel: player.vel,
        hole_iter: player.hole_iter,
        turning: player.turning,
        god: player.god,
        stop: player.stop,
        theta: player.theta,
        trig: player.trig,
        vel_t: player.vel_t,
        radius: player.radius,
        turn_rate: player.turn_rate,
        hole_rate: player.hole_rate
    }

    this.curveSocket.send(JSON.stringify({
        'type': 'player_state',
        'player': playerProperties

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

const sendPickPower = function(power_index, player_id) {
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
        'power_index': power_index,
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