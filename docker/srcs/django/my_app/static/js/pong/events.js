
    document.addEventListener('keydown', function(event)
    {
        if (!window.pong_game) return;
        const pong = window.pong_game;
        if (pong.playerNumber === 2)
        {
            if (event.key === 'ArrowUp' && pong.p2.pos[1] - pong.p_height / 2 > - pong.height / 2)
            {
                pong.p2.moving = true;
                pong.p2.vel = -5;
            }
            if (event.key === 'ArrowDown' && pong.p2.pos[1] + pong.p_height / 2 < pong.height / 2)
            {
                pong.p2.moving = true;
                pong.p2.vel = 5;
            }
        }
        if (pong.playerNumber === 1)
        {
            if (event.key === 'w' && pong.p1.pos[1] - pong.p_height / 2 > - pong.height / 2)
            {
                pong.p1.moving = true;
                pong.p1.vel = -5;
            }
            if (event.key === 's' && pong.p1.pos[1] + pong.p_height / 2 < pong.height / 2)
            {
                pong.p1.moving = true;
                pong.p1.vel = 5;
            }
        }
    });

    document.addEventListener('keyup', function(event) 
    {
        if (!window.pong_game) return;
        const pong = window.pong_game;
        if (pong.playerNumber === 2)
        {
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') 
            {
                pong.p2.moving = false;
                pong.p2.vel = 0;
            }
        }
        if (pong.playerNumber === 1)
        {
            if (event.key === 'w' || event.key === 's') 
            {
                pong.p1.moving = false;
                pong.p1.vel = 0;
            }
        }
    });