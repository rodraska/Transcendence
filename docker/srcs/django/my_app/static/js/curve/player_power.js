const pick_powerups = function()
{
    for (let i = 0; i < this.game.powers.length; i++)
    {
        if (this.stop == true) break;
        if (this.game.dist(this.pos, this.game.powers[i].pos) <= (this.radius + 20))
        {
            this.give_powerup(this.game.powers[i].id);
            this.game.sendPickPower(i);
            //this.game.powers.splice(i, 1);
            i--;
        }
    }
    console.log('out of for loop');
    this.iter_power();
}

const give_powerup = function(id)
{
    if (id <= 4) //give me
    {
        console.log('give me');
        let power = new this.game.powerConstructors[id](id, [0, 0], this.game.baseIters[id]);
        this.powers.push(power);
    }
    if (id == 5) //renew me
    {
        let id_renew = this.check_powerup(id)
        if (id_renew == -1)
        {
            let power = new this.game.powerConstructors[id](id, [0, 0], this.game.baseIters[id]);
            this.powers.push(power);
        } 
        else this.powers[id_renew].iters = this.game.baseIters[id]; 
    }
    if (id >= 6 && id <= 9) //give others
    {
        for (let i = 0; i < this.game.players.length; i++)
        {
            if (this.game.players[i].id != this.id)
            {
                let power = new this.game.powerConstructors[id](id, [0, 0], this.game.baseIters[id]);
                this.game.players[i].powers.push(power);
            } 
        }
    }
    if (id == 10) //general
    {
        this.game.currentIters[id] = this.game.baseIters[id];
        this.game.reset_paint();
    }
}

const iter_power = function()
{
    for (let i = 0; i < this.powers.length; i++)
    {
        let curr_power = this.powers[i];
        if (curr_power.iters == this.game.baseIters[curr_power.id] && this.count_powerup(curr_power.id) < 4)
            curr_power.powerApply(this);
        if (curr_power.iters == -1)
        {
            curr_power.powerRemove(this);
            this.powers.splice(i, 1);
            i--;
        }
        curr_power.iters--;
    }
}

export { pick_powerups, give_powerup, iter_power }
