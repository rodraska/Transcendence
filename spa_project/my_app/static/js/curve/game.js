class CurveGame
{
    numberCurvePlayers = 2;
    players = [];
    powers = [];
    round = 1;
    dead = 0;
    stp = 0;
    round_winner = 0;
    game_winner = 0;

    baseValues = {
    radius: 4.20,
    vel: 1.75,
    turn: 0.015,
    hole: 101
    }

    powerColors = {
        1: "lime",
        2: "yellow",
        3: "cyan",
        4: "blue",
        5: "pink",
        6: "green",
        7: "orange",
        8: "brown",
        9: "purple",
        10: "red",
        11: "gold",
        12: "lightgray",
        13: "violet",
        14: 'magenta',
        15: "white",
    }

    baseIters = {
        1: 180,
        2: 600,
        3: 900,
        4: 900,
        5: 360,
        6: 180,
        7: 300,
        8: 420,
        9: 300,
        10: 300,
        11: 600,
        12: 600,
        13: 600,
        14: 600,
        15: 25,
    }

    currentIters = {
        begin: 0,
        end: 0,
        load: 0,
        12: 0,
        13: 0,
        14: 0,
        15: 0
    }
    
    playerColors = {
        1: "blue",
        2: "red",
        3: "yellow",
        4: "green"
    }
    
    playerRGB = {
        1: [0, 0, 255],
        2: [255, 0, 0],
        3: [255, 255, 0],
        4: [0, 255, 0]
    }
    
    playerControls = {
        1: ["ArrowUp", "ArrowLeft"],
        2: ["d", "a"],
        3: ["3", "1"],
        4: ["m", "b"]
    }
    
    playerArrows = {
        1: ["Up", "Left"],
        2: ["D", "A"],
        3: ["3", "1"],
        4: ["M", "B"]
    }
    
    playerScores = {
        0: 0,
        1: 0,
        2: 0,
        3: 0,
        4: 0
    }

    gameCoordinates()
    {
        for (let i = 0; i < this.players.length; i++)
        {
            this.players[i].generalized_coordinates();
        }
    }

    gameSaveHist()
    {
        for (let i = 0; i < this.players.length; i++)
        {
            this.players[i].save_hist();
        }
    } 

    gameHoles()
    {
        for (let i = 0; i < this.players.length; i++)
        {
            this.players[i].holes();
        }
    }

    gamePowers()
    {
        for (let i = 0; i < this.players.length; i++)
        {
            this.players[i].pick_powerups();
        }
    }

    gameCheckCollision()
    {
        for (let i = 0; i < this.players.length; i++)
        {
            this.players[i].checkCollision();
        }
    }

    gamePaintHist()
    {
        for (let i = 0; i < this.players.length; i++)
        {
            this.players[i].paint_hist();
        }
    } 

    gamePaintCurvePlayer()
    {
        for (let i = 0; i < this.players.length; i++)
        {
            this.players[i].paint_player();
        }
    } 

    gamePaintArcs()
    {
        for (let i = 0; i < this.players.length; i++)
        {
            this.players[i].paint_arcs();
        }
    } 

    gamePaintArrows()
    {
        for (let i = 0; i < this.players.length; i++)
        {
            this.players[i].paint_arrow();
        }
    } 

    gamePaintPowers()
    {
        for (let i = 0; i < this.powers.length; i++)
        {
            this.powers[i].paint_powerup();
        }
    } 

    saveCanvas() 
    {
        s_ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height)
    }

    restoreCanvas() 
    {
        ctx.drawImage(s_canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height)
    }
}

const FtCurveGame = CurveGame.prototype;

game = new CurveGame();
