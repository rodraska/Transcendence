FtPlayer.pick_powerups = function()
{
    for (let i = 0; i < game.powers.length; i++)
    {
        if (this.stop == true) break;
        if (game.dist(this.pos, game.powers[i].pos) <= (this.radius + 20))
        {
            this.give_powerup(game.powers[i].id);
            game.powers.splice(i, 1);
            i--;
        }
    }
    this.iter_power();
}

FtPlayer.give_powerup = function(id)
{
    if (id <= 4) //give me
    {
        let power = new game.powerConstructors[id](id, [0, 0], game.baseIters[id], this);
        this.powers.push(power);
    }
    if (id == 5) //renew me
    {
        let id_renew = this.check_powerup(id)
        if (id_renew == -1)
        {
            let power = new game.powerConstructors[id](id, [0, 0], game.baseIters[id], this);
            this.powers.push(power);
        } 
        else this.powers[id_renew].iters = game.baseIters[id]; 
    }
    if (id >= 6 && id <= 9) //give others
    {
        for (let i = 0; i < game.players.length; i++)
        {
            if (game.players[i].id != this.id)
            {
                let power = new game.powerConstructors[id](id, [0, 0], game.baseIters[id], game.players[i]);
                game.players[i].powers.push(power);
            } 
        }
    }
    if (id == 10) //general
    {
        game.currentIters[id] = game.baseIters[id];
        game.reset_paint();
    }
}

FtPlayer.iter_power = function()
{
    for (let i = 0; i < this.powers.length; i++)
    {
        curr_power = this.powers[i];
        if (curr_power.iters == game.baseIters[id] && this.count_powerup(curr_power.id) < 4)
            curr_power.powerApply();
        if (curr_power.iters == -1)
        {
            curr_power.powerRemove();
            this.powers.splice(i, 1);
            i--;
        }
        curr_power.iters--;
    }
}
