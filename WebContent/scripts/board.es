(function(exports)
{
	"use strict";

	var Cell =
	{
		FREE: 0,
		X: 1,
		O: 2,
	};
	Cell.ANY = [Cell.FREE, Cell.X, Cell.O];

	/*********
	 * 0 1 2 *
	 * 3 4 5 *
	 * 6 7 8 *
	 *********/
	function Board(cells, turn)
	{
		function decode(board, integer)
		{
			if (integer > 524287 || integer < 0)
			{
				throw Error(integer + " is out of bounds for decoding a tic tac toe board.");
			}
			else
			{
				board.turn = (integer >>> 18 == 1) ? Cell.X : Cell.O;
				board.cells = [];
				for (var i = 0; i < 9; i++)
				{
					var freeCell = Boolean((integer >>> (i + 9)) & 1);
					var cell = Cell.FREE;
					if (!freeCell)
					{
						cell = Boolean((integer >>> i) & 1) ? Cell.X : Cell.O;
					}
					board.cells.push(cell);
				}
			}
		}

		var turnDefined = (function defineCells(board, cells)
		{
			var turnDefined = false;
			if (cells == undefined)
			{
				board.cells = new Array(9);
				board.turn = Cell.X;

				for (var i = 0; i < board.cells.length; i++)
				{
					board.cells[i] = Cell.FREE;
				}
			}
			else
			{
				if (typeof cells === "number")
				{
					decode(board, cells);
					turnDefined = true;
				}
				else if (cells.length == 9)
				{
					if (cells.every(function(cell) {return Cell.ANY.some(function(comparison) { return comparison == cell; }); }))
					{
						board.cells = cells;
					}
					else
					{
						throw Error("A Tic Tac Toe cell can be X, O, or free only.");
					}
				}
				else
				{
					throw Error("A Tic Tac Toe board has nine cells.");
				}
			}
			return turnDefined;
		})(this, cells);

		if (!turnDefined)
			(function defineTurn(board, turn)
			{
				if (turn == undefined)
				{
					board.turn = Cell.X;
				}
				else if (turn != Cell.X && turn != Cell.O)
				{
					throw Error("player is either 'X' or 'O'.");
				}
				else
				{
					board.turn = turn;
				}
			})(this, turn);
	}

	Board.prototype =
	{
		see: function()
		{
			return this.cells;
		},

		winning: [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]],

		index: function(x, y)
		{
			return 3 * y + x;
		},

		coordinates: function(index)
		{
			var y = Math.floor(index / 3);
			return [index - (3 * y), y];
		},

		other: function(player)
		{
			if (player == Cell.X)
			{
				return Cell.O;
			}
			else if (player == Cell.O)
			{
				return Cell.X;
			}

			throw Error("player is either 'X' or 'O'.");
		},

		free: function(x, y)
		{
			if (y != undefined)
			{
				x = this.index(x, y);
			}

			if (x >= this.cells.length)
			{
				throw Error(x +  " is not a valid position.");
			}

			return this.cells[x] == Cell.FREE;
		},

		mark: function(player, x, y)
		{
			if (player != Cell.X && player != Cell.O)
			{
				throw Error("player is either 'X' or 'O'.");
			}
			else if (player != this.turn)
			{
				throw Error("It's not your turn!");
			}

			if (y != undefined)
			{
				x = this.index(x, y);
			}

			if (this.free(x))
			{
				this.cells[x] = player;
				this.turn = this.other(player);
				return true;
			}
			else
			{
				return false;
			}
		},

		get full()
		{
			return this.cells.every(function(cell) { return cell != Cell.FREE; });
		},

		isWinning: function(winnable)
		{
			var cells = this.cells;
			return cells[winnable[0]] != Cell.FREE && cells[winnable[0]] == cells[winnable[1]] && cells[winnable[0]] == cells[winnable[2]];
		},

		get win()
		{
			var board = this;
			return this.winning.some(function(winnable) { return board.isWinning(winnable); });
		},

		encode: function()
		{
			return this.cells.reduce(function(previous, current, i, cells)
			{
				var freeCell = Number(current == Cell.FREE);
				var xCell = Number(current == Cell.X);
				return (previous | (xCell << i)) | (previous | (freeCell << (i + cells.length)));
			}, (Number(this.turn == Cell.X) << (this.cells.length * 2)));
		}
	};

	exports.Cell = Cell;
	exports.Board = Board;
})(typeof exports === "undefined" ? this.Board = {} : exports);