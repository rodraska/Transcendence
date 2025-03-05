document.addEventListener('keydown', function(event)
{
    if (event.key === 'ArrowUp' && pong_game.p2.pos[1] - pong_game.p_height / 2 > - height / 2)
    {
        pong_game.p2.moving = true;
        pong_game.p2.vel = -5;
    }
    if (event.key === 'ArrowDown' && pong_game.p2.pos[1] + pong_game.p_height / 2 < height / 2)
    {
        pong_game.p2.moving = true;
        pong_game.p2.vel = 5;
    }
    if (event.key === 'w' && pong_game.p1.pos[1] - pong_game.p_height / 2 > - height / 2)
    {
        pong_game.p1.moving = true;
        pong_game.p1.vel = -5;
    }
        
    if (event.key === 's' && pong_game.p1.pos[1] + pong_game.p_height / 2 < height / 2)
    {
        pong_game.p1.moving = true;
        pong_game.p1.vel = 5;
    }
});

document.addEventListener('keyup', function(event) 
{
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') 
    {
        pong_game.p2.moving = false;
        pong_game.p2.vel = 0;
    }
    if (event.key === 'w' || event.key === 's') 
    {
        pong_game.p1.moving = false;
        pong_game.p1.vel = 0;
    }
});