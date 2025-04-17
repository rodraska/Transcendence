document.addEventListener('keydown', function(event)
{
    if (!window.pong_game) return;
    const pong = window.pong_game;
    if (event.key === 'ArrowUp' && pong.p1.pos[1] - pong.p_height / 2 > - pong.height / 2)
    {
        pong.p1.moving = true;
        pong.p1.vel = -5 * pong.boost;
    }
    if (event.key === 'ArrowDown' && pong.p1.pos[1] + pong.p_height / 2 < pong.height / 2)
    {
        pong.p1.moving = true;
        pong.p1.vel = 5 * pong.boost;
    }

    if (event.key === 'w' && pong.p2.pos[1] - pong.p_height / 2 > - pong.height / 2)
    {
        pong.p2.moving = true;
        pong.p2.vel = -5 * pong.boost;
    }
    if (event.key === 's' && pong.p2.pos[1] + pong.p_height / 2 < pong.height / 2)
    {
        pong.p2.moving = true;
        pong.p2.vel = 5 * pong.boost;
    }
});

document.addEventListener('keyup', function(event) 
{
    if (!window.pong_game) return;
    const pong = window.pong_game;
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') 
    {
        pong.p1.moving = false;
        pong.p1.vel = 0;
    }
    if (event.key === 'w' || event.key === 's') 
    {
        pong.p2.moving = false;
        pong.p2.vel = 0;
    }
});

document.addEventListener('visibilitychange', function()
{
    if (!window.pong_game) return;
    const pong = window.pong_game;
    if (document.hidden) {
        if (pong.isStart && !pong.isPaused && !pong.isOver) {
            pong.ft_pause();
        }
    }
});

const gameControlEvents = function() {
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

export { gameControlEvents }