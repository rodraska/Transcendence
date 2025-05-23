const players_free = function()
{
    if (this.currentIters.begin == 150)
    {
        this.reset_paint();
        this.saveCanvas();
        return (this.players_play());
    }
    this.currentIters.load = 0;
    this.reset_paint();
    this.gameSaveHist();
    this.gameGeneralizedCoordinates();
    this.gamePaintPlayers();
    this.gamePaintArrows();
    this.paint_offset();
    this.currentIters.begin++;
    this.animationID = requestAnimationFrame(this.players_free.bind(this));
}

const begin_iter = function()
{
    if (this.currentIters[6] > 0) this.currentIters[6]--;
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
    this.gameGeneralizedCoordinates();
    this.gameHoles();
    this.gamePickPowers();
    this.gameCheckCollision();
    this.gamePaintHist();
    this.saveCanvas();
    this.gamePaintPlayers();
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
    if (this.dead >= 1) this.currentIters.end++;
    if (this.currentIters.end > 300) return (this.ft_round());
    this.begin_iter();
    this.curr_iter();
    this.end_iter();
    this.animationID = requestAnimationFrame(this.players_play.bind(this));
}

const ft_start = function(bool)
{
    console.log('ft_start');
    if (this.isOver == true) return;
    if (this.isPaused === true) return (this.ft_pause());
    if (this.isStart === true && bool == false) return;
    this.isStart = true;
    this.reset_paint();
    this.players_spawn();
    this.players_load();
    this.players_still();
}

const ft_pause = function()
{
    console.log('ft_pause: ', this.isPaused);
    if (!this.isStart) return;
    this.isPaused = !this.isPaused;
    if (this.isPaused) cancelAnimationFrame(this.animationID);
    else if (!this.isPaused && this.currentIters.begin > 150) this.animationID = requestAnimationFrame(this.players_play.bind(this));
    else if (!this.isPaused && this.currentIters.begin < 150) this.animationID = requestAnimationFrame(this.players_free.bind(this));
}

const ft_stop = function(player_number)
{
    if (this.isOver == true) return;
    console.log('ft_stop: ', player_number);
    this.isStart = false;
    this.isOver = true;
    cancelAnimationFrame(this.animationID);
    return (this.final_paint());
}

export { players_free, begin_iter, curr_iter, end_iter, players_play, ft_start, ft_pause, ft_stop }