(function(exports, Board, Player)
{
	"use strict";

	function Game(x, o)
	{
		var Cell = Board.Cell;
		this.board = new Board.Board();

		if (o == undefined)
		{
			this.o = new Player.RandomPlayer(Cell.O);
		}
		else
		{
			this.o = o;
		}

		if (x == undefined)
		{
			this.x = new Player.PopUpPlayer(Cell.X);
		}
		else
		{
			this.x = x;
		}

		function ask(board, player, other)
		{
			var over = false;

			if (board.win)
			{
				player.won(board);
				other.lost(board);
				over = true;
			}
			else if (board.full)
			{
				player.draw(board);
				other.draw(board);
				over = true;
			}

			var temp = player;
			player = other;
			other = temp;

			if (!over)
			{
				player.ask(board, function() { ask(board, player, other); });
			}
		}

		ask(this.board, this.o, this.x);
	}

	exports.Game = Game;
})(typeof exports === "undefined" ? this.Game = {} : exports, Board, Player);