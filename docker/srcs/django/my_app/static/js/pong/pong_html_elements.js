const getPongHtmlElements = function(attempts)
{
    const map = document.getElementById('pong');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    if (!map || !startBtn || !pauseBtn || !stopBtn) {
        if (attempts < 10) {
            setTimeout(() => this.getPongHtmlElements(attempts + 1), 300)
        }
        return;
    }

    this.startBtn = startBtn;
    this.pauseBtn = pauseBtn;
    this.stopBtn = stopBtn;
    this.map = map;
    this.pong_ctx = map.getContext('2d');
    this.pong_ctx.fillStyle = 'black';
    this.pong_ctx.fillRect(0, 0, map.clientWidth, map.height);

    this.width = map.width;
    this.height = map.height;

    this.p1.pos = [-this.width / 2 + this.p_width / 2 + this.p_offest, 0];
    this.p2.pos = [this.width / 2 - this.p_width / 2 - this.p_offest, 0];
}

export { getPongHtmlElements }