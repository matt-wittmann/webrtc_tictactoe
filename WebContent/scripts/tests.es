(function(exports, Board, Player, Game)
{
	"use strict";

	function assert(result)
	{
		if (!result)
		{
			throw Error("Unexpected result!");
		}
	}

	(function test1()
	{
		var cells = [Board.Cell.X, Board.Cell.X, Board.Cell.X,
		             Board.Cell.X, Board.Cell.X, Board.Cell.X,
		             Board.Cell.X, Board.Cell.X, Board.Cell.X];
		var turn = Board.Cell.X;
		var board = new Board.Board(cells, turn);
		assert(board.encode() == 262655);
		assert(board.encode() == new Board.Board(262655).encode());
	})();

	(function test2()
	{
		var cells = [Board.Cell.FREE, Board.Cell.FREE, Board.Cell.FREE,
		             Board.Cell.FREE, Board.Cell.FREE, Board.Cell.FREE,
		             Board.Cell.FREE, Board.Cell.FREE, Board.Cell.FREE];
		var turn = Board.Cell.O;
		var board = new Board.Board(cells, turn);
		assert(board.encode() == 261632);
		assert(board.encode() == new Board.Board(261632).encode());
	})();

	(function test3()
	{
		var cells = [Board.Cell.FREE, Board.Cell.FREE, Board.Cell.FREE,
		             Board.Cell.FREE, Board.Cell.FREE, Board.Cell.FREE,
		             Board.Cell.FREE, Board.Cell.FREE, Board.Cell.FREE];
		var turn = Board.Cell.X;
		var board = new Board.Board(cells, turn);
		assert(board.encode() == 523776);
		assert(board.encode() == new Board.Board(523776).encode());
	})();

	(function test4()
	{
		var cells = [Board.Cell.O, Board.Cell.O, Board.Cell.O,
		             Board.Cell.O, Board.Cell.O, Board.Cell.O,
		             Board.Cell.O, Board.Cell.O, Board.Cell.O];
		var turn = Board.Cell.O;
		var board = new Board.Board(cells, turn);
		assert(board.encode() == 0);
		assert(board.encode() == new Board.Board(0).encode());
	})();

	(function test5()
	{
		var cells = [Board.Cell.O, Board.Cell.O, Board.Cell.O,
		             Board.Cell.O, Board.Cell.O, Board.Cell.O,
		             Board.Cell.O, Board.Cell.O, Board.Cell.O];
		var turn = Board.Cell.X;
		var board = new Board.Board(cells, turn);
		assert(board.encode() == 262144);
		assert(board.encode() == new Board.Board(262144).encode());
	})();

	(function test6()
	{
		var cells = [Board.Cell.X, Board.Cell.O, Board.Cell.X,
		             Board.Cell.X, Board.Cell.X, Board.Cell.O,
		             Board.Cell.O, Board.Cell.X, Board.Cell.O];
		var turn = Board.Cell.O;
		var board = new Board.Board(cells, turn);
		assert(board.encode() == 157);
		assert(board.encode() == new Board.Board(157).encode());
	})();
})(typeof exports === "undefined" ? this.UnitTests = {} : exports, Board, Player, Game);