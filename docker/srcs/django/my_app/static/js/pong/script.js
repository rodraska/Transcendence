import { initial_conditions, initial_ball } from "./initial.js";

const update = function()
{
    let x = this.check_goal();
    if (x === 1) return (this.ft_start());
    else if (x === 2) return (this.ft_stop());
    this.update_positions();
    this.collisions();
    this.paint_loop();
    this.animationID = requestAnimationFrame(this.update.bind(this));
}

const ft_start = function()
{
    if (this.isPaused === true) return (this.ft_pause());
    if (this.isStart === true) return ;
    this.isStart = true;
    initial_conditions();
    initial_ball();
    requestAnimationFrame(this.update.bind(this));
}

const ft_pause = function()
{
    console.log('pause');
    if (!this.isStart) return ;
    this.isPaused = !this.isPaused;
    if (this.isPaused) cancelAnimationFrame(this.animationID);
    else this.animationID = requestAnimationFrame(this.update.bind(this));
}

const ft_stop = function()
{
    console.log('stop');
    this.isStart = false;
    cancelAnimationFrame(this.animationID);
    this.initial_conditions();
    this.paint_stop();
    this.p1.score = 0;
    this.p2.score = 0;
}

export { update, ft_start, ft_pause, ft_stop }