const paint_player = function()
{
    this.game.ctx.fillStyle = 'rgb(' + (this.rgb[0]) + ',' + (this.rgb[1]) + ',' + (this.rgb[2]) + ',' + (1) + ')';
    this.game.ctx.beginPath();
    this.game.ctx.arc(this.truepos[0], this.truepos[1], this.radius, Math.PI, -Math.PI, false);
    this.game.ctx.closePath();
    this.game.ctx.fill();
}

const paint_hist = function()
{
    if (this.hole_iter > 0 || this.god == true) return ;
    let x_i = this.back[0];
    let y_i = this.back[1];
    let x_m = this.mid[0];
    let y_m = this.mid[1];
    let x_f = this.truepos[0];
    let y_f = this.truepos[1];
    let w = this.radius * 2;
    this.game.ctx.strokeStyle = 'rgb(' + (this.rgb[0]) + ',' + (this.rgb[1]) + ',' + (this.rgb[2]) + ',' + (1) + ')';
    this.game.paint_curve(x_i, y_i, x_m, y_m, x_f, y_f, w);
}

const paint_arcs = function()
{
    for (let i = 0; i < this.powers.length; i++)
    {
        let curr_power = this.powers[i];
        this.game.ctx.strokeStyle = 'white';
        this.game.ctx.lineWidth = 4;
        if (curr_power.iters <= 0) continue ;
        this.game.ctx.beginPath();
        this.game.ctx.arc(this.truepos[0], this.truepos[1], this.radius + this.game.baseValues.radius * 2 + i * this.game.baseValues.radius * 1.2, this.theta, this.theta + Math.PI * 2 * curr_power.iters / this.game.baseIters[curr_power.id], false);
        this.game.ctx.stroke();
        if (curr_power.id == 6)
        {
            this.game.ctx.fillStyle = 'black';
            this.game.ctx.beginPath();
            this.game.ctx.arc(this.truepos[0], this.truepos[1], this.radius * 0.7, 0 , Math.PI * 2, true);
            this.game.ctx.fill();
        }
    }
}

const paint_arrow = function()
{
    this.game.ctx.fillStyle = this.color;
    this.game.ctx.strokeStyle = this.color;
    this.game.ctx.lineWidth = 2.5;
    let c_x = Math.floor(this.truepos[0] + 80 * this.trig[0]);
    let c_y = Math.floor(this.truepos[1] + 80 * this.trig[1]);
    let m_x = Math.floor(this.truepos[0] + 25 * this.trig[0]);
    let m_y = Math.floor(this.truepos[1] + 25 * this.trig[1]);
    let l_x = Math.floor(this.truepos[0] + 65 * this._cos(-1/6));
    let l_y = Math.floor(this.truepos[1] + 65 * this._sin(-1/6));
    let r_x = Math.floor(this.truepos[0] + 65 * this._cos(1/6));
    let r_y = Math.floor(this.truepos[1] + 65 * this._sin(1/6));
    //central line
    this.game.paint_line(Math.floor(this.truepos[0] + 15 * this.trig[0]), Math.floor(this.truepos[1] + 15 * this.trig[1]), c_x, c_y);
    //central helper left
    this.game.paint_line(c_x, c_y, Math.floor(this.truepos[0] + 65 * this._cos(-1/27)), Math.floor(this.truepos[1] + 65 * this._sin(-1/27)));
    //central helper right
    this.game.paint_line(c_x, c_y, Math.floor(this.truepos[0] + 65 * this._cos(1/27)), Math.floor(this.truepos[1] + 65 * this._sin(1/27)));
    //left curve
    this.game.paint_curve(m_x, m_y, Math.floor(this.truepos[0] + 50 * this._cos(-1/16)), Math.floor(this.truepos[1] + 50 * this._sin(-1/16)), l_x, l_y, 2.5);
    //left helper left
    this.game.paint_line(l_x, l_y, Math.floor(this.truepos[0] + 50 * this._cos(-1/6)), Math.floor(this.truepos[1] + 50 * this._sin(-1/6)));
    //left helper right
    this.game.paint_line(l_x, l_y, Math.floor(this.truepos[0] + 60 * this._cos(-7/78)), Math.floor(this.truepos[1] + 60 * this._sin(-7/78)));
    //right curve
    this.game.paint_curve(m_x, m_y, Math.floor(this.truepos[0] + 50 * this._cos(1/16)), Math.floor(this.truepos[1] + 50 * this._sin(1/16)), r_x, r_y, 2.5);
    //right helper left
    this.game.paint_line(r_x, r_y, Math.floor(this.truepos[0] + 60 * this._cos(7/78)), Math.floor(this.truepos[1] + 60 * this._sin(7/78)));
    //right helper right
    this.game.paint_line(r_x, r_y, Math.floor(this.truepos[0] + 50 * this._cos(1/6)), Math.floor(this.truepos[1] + 50 * this._sin(1/6)));
    //right text
    this.game.ctx.font = "bold 15px Arial";
    let text = this.game.playerArrows[this.id][0];
    let bottomLeftX = Math.floor(this.truepos[0] + 65 * this._cos(1/5));
    let bottomLeftY = Math.floor(this.truepos[1] + 65 * this._sin(1/5));  
    this.game.ctx.save();
    this.game.ctx.translate(bottomLeftX, bottomLeftY);
    this.game.ctx.rotate(this.theta + Math.PI / 2);
    this.game.ctx.fillText(text, 0, 0);
    this.game.ctx.restore();
    //left text
    text = this.game.playerArrows[this.id][1];
    let textWidth = this.game.ctx.measureText(text).width;
    let bottomRightX = Math.floor(this.truepos[0] + 65 * this._cos(-1/5)) + textWidth * this.trig[1];
    let bottomRightY = Math.floor(this.truepos[1] + 65 * this._sin(-1/5)) - textWidth * this.trig[0];
    this.game.ctx.save();
    this.game.ctx.translate(bottomRightX, bottomRightY);
    this.game.ctx.rotate(this.theta + Math.PI / 2);
    this.game.ctx.fillText(text, 0, 0);
    this.game.ctx.restore();
}

export { paint_player, paint_hist, paint_arcs, paint_arrow }