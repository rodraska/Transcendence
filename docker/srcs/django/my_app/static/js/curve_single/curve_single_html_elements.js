const getCurveHtmlElements = function(attempts)
{
    const canvas = document.getElementById('curve');
    const playerList = document.getElementById('playerList');
    const startBtn = document.getElementById('start_btn');
    const pauseBtn = document.getElementById('pause_btn');
    const stopBtn = document.getElementById('stop_btn');
    if (!canvas || !playerList || !startBtn || !pauseBtn || !stopBtn) {
        if (attempts < 10) {
            setTimeout(() => this.getCurveHtmlElements(attempts + 1), 300)
        }
        return;
    }

    this.startBtn = startBtn;
    this.pauseBtn = pauseBtn;
    this.stopBtn = stopBtn;
    this.canvas = canvas;
    this.playerList = playerList;
    this.ctx = canvas.getContext('2d');
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.s_canvas = document.createElement("canvas");
    this.s_canvas.width = canvas.width;
    this.s_canvas.height = canvas.height;
    this.s_ctx = this.s_canvas.getContext('2d');

    this.offset = 4;
    this.width = canvas.width;
    this.height = canvas.height;

    this.numberCurvePlayers = 2;
}

export { getCurveHtmlElements }