var map;
var ctx;

var width;
var height;

pong_game = new PongGame();

FtPongGame.update = function () {
  let x = this.check_goal();
  if (x === 1) return this.ft_start();
  else if (x === 2) return this.ft_stop();
  this.update_positions();
  this.collisions();
  this.paint_loop();
  this.animationID = requestAnimationFrame(this.update.bind(this));
};

FtPongGame.ft_start = function () {
  if (this.isPaused === true) return this.ft_pause();
  if (this.isStart === true) return;
  this.isStart = true;
  this.initial_conditions();
  this.initial_ball();
  requestAnimationFrame(this.update.bind(this));
};

FtPongGame.ft_pause = function () {
  console.log("pause");
  if (!this.isStart) return;
  this.isPaused = !this.isPaused;
  if (this.isPaused) cancelAnimationFrame(this.animationID);
  else this.animationID = requestAnimationFrame(this.update.bind(this));
};

// FtPongGame.ft_stop = function()
// {
//     console.log('stop');
//     this.isStart = false;
//     cancelAnimationFrame(this.animationID);
//     this.initial_conditions();
//     this.paint_stop();
//     this.p1.score = 0;
//     this.p2.score = 0;
// }

FtPongGame.paint_winner = function () {
  ctx.clearRect(0, 0, map.width, map.height);
  this.paint_black();
  this.paint_squares();
  this.paint_score();
  let winnerIdentifier =
    this.p1.score === this.win_score ? "Player 1" : "Player 2";
  let winnerText =
    window.currentTournamentMatch && window.currentTournamentMatch.players
      ? winnerIdentifier === "Player 1"
        ? window.currentTournamentMatch.players[0]
        : window.currentTournamentMatch.players[1]
      : winnerIdentifier;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "white";
  ctx.font = "40px 'Press Start 2P', cursive";
  ctx.fillText("Winner: " + winnerText, width / 2, height / 2);
  this.paint_players();
};

FtPongGame.ft_stop = function () {
  console.log("stop");
  this.isStart = false;
  cancelAnimationFrame(this.animationID);
  this.initial_conditions();
  if (document.getElementById("pong").closest("#pongGameContainer")) {
    if (this.p1.score === this.win_score || this.p2.score === this.win_score) {
      const player1Score = this.p1.score;
      const player2Score = this.p2.score;
      const player1Name =
        window.currentTournamentMatch && window.currentTournamentMatch.players
          ? window.currentTournamentMatch.players[0]
          : "Player 1";
      const player2Name =
        window.currentTournamentMatch && window.currentTournamentMatch.players
          ? window.currentTournamentMatch.players[1]
          : "Player 2";
      const winnerName =
        player1Score === this.win_score ? player1Name : player2Name;
      const loserName =
        player1Score === this.win_score ? player2Name : player1Name;
      const scoreResult = player1Score + ":" + player2Score;
      this.paint_winner();
      setTimeout(() => {
        if (typeof window.tournamentGameFinished === "function") {
          window.tournamentGameFinished({
            winner: winnerName,
            result: scoreResult,
          });
        }
      }, 2000);
    } else {
      this.paint_stop();
    }
  } else {
    this.paint_stop();
  }
  this.p1.score = 0;
  this.p2.score = 0;
};
