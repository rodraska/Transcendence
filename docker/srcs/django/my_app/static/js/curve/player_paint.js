FtPlayer.paint_player = function()
{
    ctx.fillStyle = 'rgb(' + (this.rgb[0]) + ',' + (this.rgb[1]) + ',' + (this.rgb[2]) + ',' + (1) + ')';
    ctx.beginPath();
    ctx.arc(this.truepos[0], this.truepos[1], this.radius, Math.PI, -Math.PI, false);
    ctx.closePath();
    ctx.fill();
}

FtPlayer.paint_hist = function()
{
    if (this.hole_iter > 0 || this.god == true) return ;
    let x_i = this.back[0];
    let y_i = this.back[1];
    let x_m = this.mid[0];
    let y_m = this.mid[1];
    let x_f = this.truepos[0];
    let y_f = this.truepos[1];
    let w = this.radius * 2;
    ctx.strokeStyle = 'rgb(' + (this.rgb[0]) + ',' + (this.rgb[1]) + ',' + (this.rgb[2]) + ',' + (1) + ')';
    this.paint_curve(x_i, y_i, x_m, y_m, x_f, y_f, w);
}

FtPlayer.paint_arcs = function()
{
    for (let i = 0; i < this.powers.length; i++)
    {
        let curr_power = this.powers[i];
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 4;
        if (curr_power.iters <= 0) continue ;
        ctx.beginPath();
        ctx.arc(this.truepos[0], this.truepos[1], this.radius + this.baseValues.radius * 2 + i * this.baseValues.radius * 1.2, this.theta, this.theta + Math.PI * 2 * curr_power.iters / this.baseIters[curr_power.id], false);
        ctx.stroke();
        if (curr_power.id == 10)
        {
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(this.truepos[0], this.truepos[1], this.radius * 0.7, 0 , Math.PI * 2, true);
            ctx.fill();
        }
    }
}

FtPlayer.paint_arrow = function()
{
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2.5;
    theta = this.theta;
    c_x = Math.floor(this.truepos[0] + 80 * this.trig[0]);
    c_y = Math.floor(this.truepos[1] + 80 * this.trig[1]);
    m_x = Math.floor(this.truepos[0] + 25 * this.trig[0]);
    m_y = Math.floor(this.truepos[1] + 25 * this.trig[1]);
    l_x = Math.floor(this.truepos[0] + 65 * this._cos(-1/6));
    l_y = Math.floor(this.truepos[1] + 65 * this._sin(-1/6));
    r_x = Math.floor(this.truepos[0] + 65 * this._cos(1/6));
    r_y = Math.floor(this.truepos[1] + 65 * this._sin(1/6));
    //central line
    this.paint_line(Math.floor(this.truepos[0] + 15 * this.trig[0]), Math.floor(this.truepos[1] + 15 * this.trig[1]), c_x, c_y);
    //central helper left
    this.paint_line(c_x, c_y, Math.floor(this.truepos[0] + 65 * this._cos(-1/27)), Math.floor(this.truepos[1] + 65 * this._sin(-1/27)));
    //central helper right
    this.paint_line(c_x, c_y, Math.floor(this.truepos[0] + 65 * this._cos(1/27)), Math.floor(this.truepos[1] + 65 * this._sin(1/27)));
    //left curve
    this.paint_curve(m_x, m_y, Math.floor(this.truepos[0] + 50 * this._cos(-1/16)), Math.floor(this.truepos[1] + 50 * this._sin(-1/16)), l_x, l_y, 2.5);
    //left helper left
    this.paint_line(l_x, l_y, Math.floor(this.truepos[0] + 50 * this._cos(-1/6)), Math.floor(this.truepos[1] + 50 * this._sin(-1/6)));
    //left helper right
    this.paint_line(l_x, l_y, Math.floor(this.truepos[0] + 60 * this._cos(-7/78)), Math.floor(this.truepos[1] + 60 * this._sin(-7/78)));
    //right curve
    this.paint_curve(m_x, m_y, Math.floor(this.truepos[0] + 50 * this._cos(1/16)), Math.floor(this.truepos[1] + 50 * this._sin(1/16)), r_x, r_y, 2.5);
    //right helper left
    this.paint_line(r_x, r_y, Math.floor(this.truepos[0] + 60 * this._cos(7/78)), Math.floor(this.truepos[1] + 60 * this._sin(7/78)));
    //right helper right
    this.paint_line(r_x, r_y, Math.floor(this.truepos[0] + 50 * this._cos(1/6)), Math.floor(this.truepos[1] + 50 * this._sin(1/6)));
    //right text
    ctx.font = "bold 15px Arial";
    text = this.playerArrows[this.id][0];
    bottomLeftX = Math.floor(this.truepos[0] + 65 * this._cos(1/5));
    bottomLeftY = Math.floor(this.truepos[1] + 65 * this._sin(1/5));  
    ctx.save();
    ctx.translate(bottomLeftX, bottomLeftY);
    ctx.rotate(theta + Math.PI / 2);
    ctx.fillText(text, 0, 0);
    ctx.restore();
    //left text
    text = this.playerArrows[this.id][1];
    textWidth = ctx.measureText(text).width;
    bottomRightX = Math.floor(this.truepos[0] + 65 * this._cos(-1/5)) + textWidth * this.trig[1];
    bottomRightY = Math.floor(this.truepos[1] + 65 * this._sin(-1/5)) - textWidth * this.trig[0];
    ctx.save();
    ctx.translate(bottomRightX, bottomRightY);
    ctx.rotate(theta + Math.PI / 2);
    ctx.fillText(text, 0, 0);
    ctx.restore();
}