const players_free = function()
{
    this.sendPlayerState(this.myPlayer);
    if (this.currentIters.begin == 150)
    {
        this.reset_paint();
        this.saveCanvas();
        return (this.players_play());
    }
    this.currentIters.load = 0;
    this.reset_paint();
    this.myPlayer.save_hist();
    this.myPlayer.generalized_coordinates();
    this.gamePaintPlayer();
    this.myPlayer.paint_arrow();
    this.paint_offset();
    this.currentIters.begin++;
    requestAnimationFrame(this.players_free.bind(this));
}

const begin_iter = function()
{
    this.sendPlayerState(this.myPlayer);
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
    this.myPlayer.save_hist();
    this.myPlayer.generalized_coordinates();
    this.myPlayer.holes();
    this.myPlayer.pick_powerups();
    this.myPlayer.checkCollision();
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
    if (this.dead >= 1) this.currentIters.end++;
    if (this.currentIters.end > 300) return (this.ft_round());
    this.begin_iter();
    this.curr_iter();
    this.end_iter();
    this.animationID = requestAnimationFrame(this.players_play.bind(this));
}

const ft_start = function(bool)
{
    //console.trace("ft start called");
    console.log('ft_start');
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
    if (this.currentIters.begin < 150) return;
    if (!this.isStart) return;
    this.isPaused = !this.isPaused;
    if (this.isPaused) cancelAnimationFrame(this.animationID);
    else this.animationID = requestAnimationFrame(this.players_play.bind(this));
}

const ft_stop = function()
{
    this.isStart = false;
    cancelAnimationFrame(this.animationID);
    this.game_winner = 1;
    this.paint_gg();
}

export { players_free, begin_iter, curr_iter, end_iter, players_play, ft_start, ft_pause, ft_stop }