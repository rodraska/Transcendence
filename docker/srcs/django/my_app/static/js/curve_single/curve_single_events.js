document.addEventListener('keydown', function(event)
{
    if (!window.curve_game) return;
    const curve = window.curve_game;
    for (let i = 0; i < curve.players.length; i++)
    {
        if (event.key === curve.players[i].right)
            curve.players[i].turning = 1;
        if (event.key === curve.players[i].left)
            curve.players[i].turning = 2;
    }
});

document.addEventListener('keyup', function(event) 
{
    if (!window.curve_game) return;
    const curve = window.curve_game;
    for (let i = 0; i < curve.players.length; i++)
    {
        if (event.key === curve.players[i].right || event.key === curve.players[i].left)
        {
            curve.players[i].turning = 0;
            curve.players[i].vel[0] = curve.players[i].vel_t * curve.players[i].trig[0];
            curve.players[i].vel[1] = curve.players[i].vel_t * curve.players[i].trig[1];
        }
    }
});

document.addEventListener('visibilitychange', function()
{
    if (!window.curve_game) return;
    const curve = window.curve_game;

    if (document.hidden) {
        if (curve.isStart && !curve.isPaused && !curve.isOver) {
            curve.sendGameControl('pause');
        }
    }
});

const curveGameControlEvents = function() {
    if (this.startBtn) {
        this.startBtn.addEventListener('click', () => {
            this.ft_start();
        });
    }
    if (this.pauseBtn) {
        this.pauseBtn.addEventListener('click', () => {
            this.ft_pause();
        });
    }
    if (this.stopBtn) {
        this.stopBtn.addEventListener('click', () => {
            this.ft_stop();
        });
    }
}

export { curveGameControlEvents }
