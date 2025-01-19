document.addEventListener('keydown', function(event)
{
    if (event.key === 'ArrowUp' && game.p2.pos[1] - game.p_height / 2 > - height / 2)
    {
        game.p2.moving = true;
        game.p2.vel = -5;
    }
    if (event.key === 'ArrowDown' && game.p2.pos[1] + game.p_height / 2 < height / 2)
    {
        game.p2.moving = true;
        game.p2.vel = 5;
    }
    if (event.key === 'w' && game.p1.pos[1] - game.p_height / 2 > - height / 2)
    {
        game.p1.moving = true;
        game.p1.vel = -5;
    }
        
    if (event.key === 's' && game.p1.pos[1] + game.p_height / 2 < height / 2)
    {
        game.p1.moving = true;
        game.p1.vel = 5;
    }
});

document.addEventListener('keyup', function(event) 
{
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') 
    {
        game.p2.moving = false;
        game.p2.vel = 0;
    }
    if (event.key === 'w' || event.key === 's') 
    {
        game.p1.moving = false;
        game.p1.vel = 0;
    }
});