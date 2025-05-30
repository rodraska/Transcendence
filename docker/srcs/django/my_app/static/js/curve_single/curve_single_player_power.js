const pick_powerups = function()
{
    if (this.stop == true || this.game.powerups_enabled == false) return;
    for (let i = 0; i < this.game.powers.length; i++)
    {
        if (this.stop == true) break;
        if (this.game.dist(this.pos, this.game.powers[i].pos) <= (this.radius + 20))
        {
            this.give_powerup(this.game.powers[i].id);
            this.game.powers.splice(i, 1);
            //this.game.sendGamePowers(this.game.powers);
            i--;
        }
    }
    this.iter_power();
}

const give_powerup = function(id)
{
    if (id <= 2) //give me
    {
        let power = new this.game.powerConstructors[id](id, [0, 0], this.game.baseIters[id]);
        this.powers.push(power);
    }
    else if (id == 3) //renew me
    {
        let id_renew = this.check_powerup(id)
        if (id_renew == -1)
        {
            let power = new this.game.powerConstructors[id](id, [0, 0], this.game.baseIters[id]);
            this.powers.push(power);
        } 
        else this.powers[id_renew].iters = this.game.baseIters[id]; 
    }
    else if (id >= 4 && id <= 5) //give others
    {
        let power = new this.powerConstructors[power_id](power_id, [0, 0], this.baseIters[power_id])
        if (this.id == 1)
            this.game.players[1].powers.push(power);
        else
            this.game.players[0].powers.push(power);
        //this.game.sendPickOthers(id);
    }
    else if (id == 6) //general
    {
        this.currentIters[6] = this.baseIters[6];
        this.erase = true;
        //this.game.sendPickGeneral();
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
