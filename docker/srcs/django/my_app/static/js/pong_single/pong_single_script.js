const update = function()
{
    //console.log('update');
    if (this.playerNumber === 1) {
        this.sendPaddlePosition(this.p1.pos);
        this.sendBallUpdate(this.ball.pos, this.ball.vel_t);
    }
    else if (this.playerNumber === 2)
        this.sendPaddlePosition(this.p2.pos);
    if (this.playerNumber === 1)
    {
        let x = this.check_goal();
        if (x === 1) return (this.ft_start());
        else if (x === 2) return (this.ft_stop(3));
    }
    this.update_positions();
    this.collisions();
    this.paint_loop();
    this.animationID = requestAnimationFrame(this.update.bind(this));
}

const ft_start = function()
{
    console.log('ft_start');
    if (this.isOver == true) return;
    //console.trace('ft start called');
    if (this.isPaused === true) return (this.ft_pause());
    if (this.isStart === true) return ;
    this.isStart = true;
    this.initial_conditions();
    this.initial_ball();
    requestAnimationFrame(this.update.bind(this));
}

const ft_pause = function()
{
    console.log('ft_pause');
    if (!this.isStart) return ;
    this.isPaused = !this.isPaused;
    if (this.isPaused) cancelAnimationFrame(this.animationID);
    else this.animationID = requestAnimationFrame(this.update.bind(this));
}

const ft_stop = function(player_number)
{
    if (this.isOver == true) return;
    console.log('ft_stop: ', player_number);
    this.isStart = false;
    this.isOver = true;
    this.score = 'forfeit';
    cancelAnimationFrame(this.animationID);
    if (player_number == 1) {
        this.p1.score = 0;
        this.p2.score = this.points_to_win;
    }
    else if (player_number == 2) {
        this.p1.score = this.points_to_win;
        this.p2.score = 0;
    }
    this.initial_conditions();
    this.paint_stop();
    if (this.playerNumber == 1)
        this.sendGameOver();
}

export { update, ft_start, ft_pause, ft_stop }