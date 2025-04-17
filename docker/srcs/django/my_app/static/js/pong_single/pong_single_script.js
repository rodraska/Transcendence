const update = function () {
  console.log("update");
  let x = this.check_goal();
  if (x === 1) return this.ft_start();
  else if (x === 2) return this.ft_stop(3);
  this.update_positions();
  this.collisions();
  this.paint_loop();
  this.animationID = requestAnimationFrame(this.update.bind(this));
};

const ft_start = function () {
  console.log("ft_start");
  if (this.isOver == true) return;
  //console.trace('ft start called');
  if (this.isPaused === true) return this.ft_pause();
  if (this.isStart === true) return;
  this.isStart = true;
  this.initial_conditions();
  this.initial_ball();
  requestAnimationFrame(this.update.bind(this));
};

const ft_pause = function () {
  console.log("ft_pause");
  if (!this.isStart) return;
  this.isPaused = !this.isPaused;
  if (this.isPaused) cancelAnimationFrame(this.animationID);
  else this.animationID = requestAnimationFrame(this.update.bind(this));
};

const ft_stop = function (forfeiter) {
  if (this.isOver) return;

  this.isStart = false;
  this.isOver = true;
  cancelAnimationFrame(this.animationID);

  if (forfeiter === 1) {
    this.p1.score = 0;
    this.p2.score = this.points_to_win;
  } else if (forfeiter === 2) {
    this.p1.score = this.points_to_win;
    this.p2.score = 0;
  }

  this.initial_conditions();
  this.paint_stop();

  const inModal = !!document
    .getElementById("pong")
    .closest("#pongGameContainer");

  if (inModal) {
    const [a1, a2] = window.currentTournamentMatch.players;
    const winnerAlias = this.p1.score > this.p2.score ? a1 : a2;
    const resultText = `${this.p1.score}:${this.p2.score}`;

    setTimeout(() => {
      if (typeof window.tournamentGameFinished === "function") {
        window.tournamentGameFinished({
          winner: winnerAlias,
          result: resultText,
        });
      }
    }, 2000);
  }

  this.p1.score = 0;
  this.p2.score = 0;
};

export { update, ft_start, ft_pause, ft_stop };
