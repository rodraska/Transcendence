document.addEventListener('keydown', function(event)
{
    for (let i = 0; i < game.players.length; i++)
    {
        if (event.key === game.players[i].right)
            game.players[i].turning = 1;
        if (event.key === game.players[i].left)
            game.players[i].turning = 2;
    }
});

document.addEventListener('keyup', function(event) 
{
    for (let i = 0; i < game.players.length; i++)
    {
        if (event.key === game.players[i].right || event.key === game.players[i].left)
        {
            game.players[i].turning = 0;
            game.players[i].vel[0] = game.players[i].vel_t * game.players[i].trig[0];
            game.players[i].vel[1] = game.players[i].vel_t * game.players[i].trig[1];
        }
    }
});