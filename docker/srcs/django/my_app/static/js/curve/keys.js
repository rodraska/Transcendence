document.addEventListener('keydown', function(event)
{
    for (let i = 0; i < this.players.length; i++)
    {
        if (event.key === this.players[i].right)
            this.players[i].turning = 1;
        if (event.key === this.players[i].left)
            this.players[i].turning = 2;
    }
});

document.addEventListener('keyup', function(event) 
{
    for (let i = 0; i < this.players.length; i++)
    {
        if (event.key === this.players[i].right || event.key === this.players[i].left)
        {
            this.players[i].turning = 0;
            this.players[i].vel[0] = this.players[i].vel_t * this.players[i].trig[0];
            this.players[i].vel[1] = this.players[i].vel_t * this.players[i].trig[1];
        }
    }
});