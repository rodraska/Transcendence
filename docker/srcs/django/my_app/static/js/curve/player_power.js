const pick_powerups = function()
{
    for (let i = 0; i < this.powers.length; i++)
    {
        if (this.stop == true) break;
        if (this.dist(this.pos, this.powers[i].pos) <= (this.radius + 20))
        {
            this.give_powerup(this.powers[i].id);
            this.powers.splice(i, 1);
            i--;
        }
    }
    this.iter_power();
}

const give_powerup = function(id)
{
    if (id <= 4) //give me
    {
        let power = new this.powerConstructors[id](id, [0, 0], this.baseIters[id], this);
        this.powers.push(power);
    }
    if (id == 5) //renew me
    {
        let id_renew = this.check_powerup(id)
        if (id_renew == -1)
        {
            let power = new this.powerConstructors[id](id, [0, 0], this.baseIters[id], this);
            this.powers.push(power);
        } 
        else this.powers[id_renew].iters = this.baseIters[id]; 
    }
    if (id >= 6 && id <= 9) //give others
    {
        for (let i = 0; i < this.players.length; i++)
        {
            if (this.players[i].id != this.id)
            {
                let power = new this.powerConstructors[id](id, [0, 0], this.baseIters[id], this.players[i]);
                this.players[i].powers.push(power);
            } 
        }
    }
    if (id == 10) //general
    {
        this.currentIters[id] = this.baseIters[id];
        this.reset_paint();
    }
}

const iter_power = function()
{
    for (let i = 0; i < this.powers.length; i++)
    {
        curr_power = this.powers[i];
        if (curr_power.iters == this.baseIters[id] && this.count_powerup(curr_power.id) < 4)
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

export { pick_powerups, give_powerup, iter_power }
