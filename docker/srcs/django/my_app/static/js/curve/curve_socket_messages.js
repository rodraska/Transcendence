const handleSocketMessage = function(data)
{
    const type = data.type;

    switch (type)
    {
        case 'player_disconnect':
            console.log('player_disconnect');
            this.ft_stop(3);
            break;
        case 'player_state':
            const player = data.player;
            const targetPlayer = this.players[player.id - 1];
            Object.assign(targetPlayer, player);
            break;
        
        case 'new_power':
            const power = data.power;
            this.powers.push(new this.powerConstructors[power.id](power.id, power.pos, power.iters));
            break;
        
        case 'pick_others':
            const power_id = data.power_id;
            if (this.myPlayer.stop == false) {
                let power = new this.powerConstructors[power_id](power_id, [0, 0], this.baseIters[power_id])
                this.myPlayer.powers.push(power);
            }
            break;
                

        case 'pick_general':
            this.currentIters[6] = this.baseIters[6];
            this.erase = true;
            break;

        case 'collision':
            this.players[data.player_id - 1].processCollision();
            break;

        case 'game_powers':
            this.powers = [];
            const powers = data.powers;
            powers.forEach(power => {
                this.powers.push(new this.powerConstructors[power.id](power.id, power.pos, power.iters))
            });
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
            console.log('receive game_over');
            this.closeCurveSocket();
            break;
            
        default:
            console.log('Unkown message type:', type);
    }
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
    this.myPlayer = this.players[this.playerNumber - 1];
    this.points_to_win = this.matchData.points_to_win;
    this.powerups_enabled = this.matchData.powerups_enabled;
    this.getElementById("name1").innerHTML = this.matchData.player1;
    this.getElementById("name2").innerHTML = this.matchData.player2;
    this.getElementById("pointToWin").innerHTML = "Point to Win: " + this.points_to_win;
}

const checkSocket = function() {
    if (!this.curveSocket || this.curveSocket.readyState !== WebSocket.OPEN) {
        console.error("Curve socket not connected");
        return 0;
    }

    if (!this.playerNumber) {
        console.error("Player number not assigned");
        return 0;
    }

    return 1;
}

const sendPlayerState = function(player) {

    if (!this.checkSocket()) return;

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

const sendPickOthers = function(power_id) {
    if (!this.checkSocket()) return;

    this.curveSocket.send(JSON.stringify({
        'type': 'pick_others',
        'power_id': power_id
    }))
}

const sendPickGeneral = function() {
    if (!this.checkSocket()) return;

    this.curveSocket.send(JSON.stringify({
        'type': 'pick_general'
    }))
}

const sendCollision = function(player_id) {
    if (!this.checkSocket()) return;

    this.curveSocket.send(JSON.stringify({
        'type': 'collision',
        'player_id': player_id
    }))
}

const sendGamePowers = function(powers) {
    if (!this.checkSocket()) return;

    const powerPropertiesList = powers.map(power => ({
        id: power.id,
        pos: power.pos,
        iters: power.iters
    }));

    this.curveSocket.send(JSON.stringify({
        'type': 'game_powers',
        'powers': powerPropertiesList
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

    console.log('send game control: ', this.playerNumber);

    this.curveSocket.send(JSON.stringify({
        'type': 'game_control',
        'action': action,
        'player_number': this.playerNumber
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

    console.log('send match data');

    this.setMatchData();

    this.curveSocket.send(JSON.stringify({
        'type': 'match_data',
        'match_data': this.matchData,
    }))
}

const sendGameOver = function() {
    if (!this.checkSocket()) return;

    //let winner_name = this.players[this.game_winner - 1].name

    let winner_name = window.currentMatchData.player1;
    if (this.game_winner == 2)
        winner_name = window.currentMatchData.player2;

    console.trace('winner_name: ', winner_name);

    this.curveSocket.send(JSON.stringify({
        'type': 'game_over',
        'winner': winner_name,
        'match_id': this.matchData.matchId,
        'score': this.score,
    }))
}

export { handleSocketMessage, checkSocket, setMatchData, sendPlayerState, sendPickOthers, sendPickGeneral, sendCollision, sendGamePowers, sendGameControl, sendMatchData, sendGameOver }