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

const curveGameControlEvents = function() {
    if (!window.curve_game) return;
    const curve = window.curve_game;
    if (curve.startBtn) {
        curve.startBtn.addEventListener('click', () => {
            curve.sendGameControl('start');
        });
    }
    if (curve.pauseBtn) {
        curve.pauseBtn.addEventListener('click', () => {
            curve.sendGameControl('pause');
        });
    }
    if (curve.stopBtn) {
        curve.stopBtn.addEventListener('click', () => {
            curve.sendGameControl('stop');
        });
    }
}

export { curveGameControlEvents }
