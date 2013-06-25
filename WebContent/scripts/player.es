(function(exports, Board)
{
	"use strict";

	var Cell = Board.Cell;

	var Turn =
	{
		OTHER: 0,
		OWN: 1,
		DRAW: 2,
		LOST: 3,
		WON: 4
	};

	function Player(xo)
	{
		this.xo = xo;
		this.turn = Turn.OTHER;
	}

	Player.prototype =
	{
		ask: function(board, callback)
		{
			throw Error("The Player.prototype.ask method must be implemented!");
		},

		draw: function(board) { this.turn = Turn.DRAW; },
		lost: function(board) { this.turn = Turn.LOST; },
		won: function(board) { this.turn = Turn.WON; }
	};

	function PopUpPlayer(xo)
	{
		Player.call(xo);
		this.xo = xo;
	}

	PopUpPlayer.prototype = Object.create(Player.prototype,
	{
		places: { value: "0 1 2\n3 4 5\n6 7 8\n" },
		ask:
		{
			value: function(board, callback)
			{
				this.turn = Turn.OWN;

				var shown = board.see().reduce(function(previous, current, i)
				{
					var end = (i + 1) % 3 == 0 ? "\n" : " ";

					if (current == Cell.X)
					{
						return previous + "X" + end;
					}
					else if (current == Cell.O)
					{
						return previous + "O" + end;
					}
					else if (current == Cell.FREE)
					{
						return previous + "F" + end;
					}
				}, "");

				while (!board.mark(this.xo, prompt("It's your turn:\n" + this.places + shown)));
				this.turn = Turn.OTHER;
				callback();
			}
		},

		draw: { value: function(board) { Player.prototype.draw.apply(this, board); window.alert("Draw!"); }},
		lost: { value: function(board) { Player.prototype.lost.apply(this, board); window.alert("You lose!"); }},
		won: { value: function(board) { Player.prototype.won.apply(this, board); window.alert("You win!"); }}
	});

	function RandomPlayer(xo)
	{
		Player.call(xo);
		this.xo = xo;
	}

	RandomPlayer.prototype = Object.create(Player.prototype,
	{
		ask:
		{
			value: function(board, callback)
			{
				this.turn = Turn.OWN;
				while (!board.mark(this.xo, Math.floor(Math.random() * 8)));
				this.turn = Turn.OTHER;
				callback();
			}
		}
	});

	exports.Turn = Turn;
	exports.Player = Player;
	exports.PopUpPlayer = PopUpPlayer;
	exports.RandomPlayer = RandomPlayer;
})(typeof exports === "undefined" ? this.Player = {} : exports, Board);