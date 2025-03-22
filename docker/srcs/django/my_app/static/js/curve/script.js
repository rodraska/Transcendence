const players_free = function()
{
    this.sendPlayerState(this.players[this.playerNumber - 1]);
    if (this.currentIters.begin == 150)
    {
        this.reset_paint();
        this.saveCanvas();
        return (this.players_play());
    }
    this.currentIters.load = 0;
    this.reset_paint();
    this.gameSaveHist();
    this.gameCoordinates();
    this.gamePaintPlayer();
    this.gamePaintArrows();
    this.paint_offset();
    this.currentIters.begin++;
    requestAnimationFrame(this.players_free.bind(this));
}

const begin_iter = function()
{
    this.sendPlayerState(this.players[this.playerNumber - 1]);
    if (this.currentIters[10] > 0) this.currentIters[10]--;
    this.paint_offset();
    this.new_powerup();
    this.restoreCanvas();
}

const curr_iter = function()
{
    if (this.erase == true)
    {
        this.erase = false;
        this.reset_paint();
    }
    this.gameSaveHist();
    this.gameCoordinates();
    this.gameHoles();
    this.gamePowers();
    //this.gameCheckCollision();
    this.gamePaintHist();
    this.saveCanvas();
    this.gamePaintPlayer();
    this.gamePaintPowers();
}

const end_iter = function()
{
    if (this.currentIters.end > 60) this.paint_gg();
    this.gamePaintArcs();
    this.paint_offset();
    this.currentIters.begin++;
}

const players_play = function()
{
    if (this.stp == 1) this.currentIters.end++;
    if (this.currentIters.end > 300) return (this.ft_round());
    this.begin_iter();
    this.curr_iter();
    this.end_iter();
    requestAnimationFrame(this.players_play.bind(this));
}

const ft_start = function()
{
    //console.log('ft_start');
    console.trace("ft start called");
    this.reset_paint();
    this.players_spawn();
    this.players_load();
    this.players_still();
}

const ft_pause = function() {}

const ft_stop = function() {}

export { players_free, begin_iter, curr_iter, end_iter, players_play, ft_start, ft_pause, ft_stop }