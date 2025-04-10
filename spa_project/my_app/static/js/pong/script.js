var map;
var ctx;

var width;
var height;

pong_game = new PongGame();

FtPongGame.update = function()
{
    let x = this.check_goal();
    if (x === 1) return (this.ft_start());
    else if (x === 2) return (this.ft_stop());
    this.update_positions();
    this.collisions();
    this.paint_loop();
    this.animationID = requestAnimationFrame(this.update.bind(this));
}

FtPongGame.ft_start = function()
{
    if (this.isPaused === true) return (this.ft_pause());
    if (this.isStart === true) return ;
    this.isStart = true;
    this.initial_conditions();
    this.initial_ball();
    requestAnimationFrame(this.update.bind(this));
}

FtPongGame.ft_pause = function()
{
    console.log('pause');
    if (!this.isStart) return ;
    this.isPaused = !this.isPaused;
    if (this.isPaused) cancelAnimationFrame(this.animationID);
    else this.animationID = requestAnimationFrame(this.update.bind(this));
}

FtPongGame.ft_stop = function()
{
    console.log('stop');
    this.isStart = false;
    cancelAnimationFrame(this.animationID);
    this.initial_conditions();
    this.paint_stop();
    this.p1.score = 0;
    this.p2.score = 0;
}