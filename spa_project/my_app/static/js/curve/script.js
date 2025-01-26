var game;
var canvas;
var ctx;
var s_canvas;
var s_ctx;
var offset;
var width;
var height;

FtCurveGame.players_free = function()
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
    this.gameCoordinates();
    this.gamePaintCurvePlayer();
    this.gamePaintArrows();
    this.paint_offset();
    this.currentIters.begin++;
    requestAnimationFrame(this.players_free.bind(this));
}

FtCurveGame.begin_iter = function()
{
    for (let i = 12; i <= 15; i++) if (this.currentIters[i] > 0) this.currentIters[i]--;
    this.paint_offset();
    this.new_powerup();
    this.restoreCanvas();
}

FtCurveGame.curr_iter = function()
{
    this.gameSaveHist();
    this.gameCoordinates();
    this.gameHoles();
    this.gamePowers();
    this.gameCheckCollision();
    this.gamePaintHist();
    this.saveCanvas();
    this.gamePaintCurvePlayer();
    this.gamePaintPowers();
}

FtCurveGame.end_iter = function()
{
    if (this.currentIters[12] > 0) this.paint_bulb();
    if (this.currentIters.end > 60) this.paint_gg();
    this.gamePaintArcs();
    this.paint_offset();
    this.currentIters.begin++;
}

FtCurveGame.players_play = function()
{
    /*if (window.location.href.slice(-5) != "curve") return;
    console.log('curve update');*/
    if (this.stp == 1) this.currentIters.end++;
    if (this.currentIters.end > 300) return (this.ft_round());
    this.begin_iter();
    this.curr_iter();
    this.end_iter();
    requestAnimationFrame(this.players_play.bind(this));
}

FtCurveGame.initial_loop = function()
{
    this.reset_paint();
    this.players_spawn();
    this.players_load();
    this.players_still();
}

FtCurveGame.ft_start = function()
{
    if (this.isActive == true) return ;
    this.isActive = true;
    this.initial_loop();
}