(function(exports, Board, Player, Game)
{
	"use strict";

	function redrawBoard(board)
	{
		var mappings = ["BlankMarker", "XMarker", "OMarker"];
		for (var y = 0; y < 3; y++)
		{
			for (var x = 0; x < 3; x++)
			{
				document.getElementById("Space" + x + "by" + y).setAttributeNS("http://www.w3.org/1999/xlink", "href", "#" + mappings[board.cells[board.index(x, y)]]);
			}
		}
	}

	function SvgPlayer(xo)
	{
		Player.Player.call(xo);
		this.xo = xo;
		this.clickHandlers = [];
	}

	SvgPlayer.prototype = Object.create(Player.Player.prototype,
	{
		removeSpaceClickHandler:
		{
			value: function(space, handler)
			{
				return function() { space.removeEventListener("click", handler); };
			}
		},

		handleSpaceClick:
		{
			value: function(event, board, x, y, callback)
			{
				if (board.mark(this.xo, x, y))
				{
					var mark = null;
					if (this.xo == Board.Cell.X)
					{
						mark = "X";
					}
					else if (this.xo == Board.Cell.O)
					{
						mark = "O";
					}
	
					var space = event.target;
					space = space.correspondingElement != undefined ? space.correspondingElement : space;
					if (space.correspondingElement != undefined)
					{
						space.correspondingElement.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#" + mark + "Marker");
					}
					else
					{
						space.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#" + mark + "Marker");
					}
					for (var i = 0; i < this.clickHandlers.length; i++)
					{
						this.clickHandlers[i]();
					}
					this.turn = Player.Turn.OTHER;
					callback();
				}
				else
				{
					throw Error("The space (" + x + ", " + y + ") is not free.");
				}
			}
		},

		makeSpaceClickedHandler: {
			value: function(board, x, y, callback)
			{
				var player = this;
				return function(evt) { player.handleSpaceClick(evt, board, x, y, callback); };
			}
		},


		ask:
		{
			value: function(board, callback)
			{
				this.turn = Player.Turn.OWN;
				redrawBoard(board);
				for (var y = 0; y < 3; y++)
				{
					for (var x = 0; x < 3; x++)
					{
						if (board.free(x, y))
						{
							var space = document.getElementById("Space" + x + "by" + y);
							var handler = this.makeSpaceClickedHandler(board, x, y, callback);
							space.addEventListener("click", handler);
							this.clickHandlers.push(this.removeSpaceClickHandler(space, handler));
						}
					}
				}
			}
		},

		won:
		{
			value: function(board)
			{
				Player.Player.prototype.won.apply(this, board);
				var winners = board.winning.filter(function(winnable) { return board.isWinning(winnable); });
				document.getElementById("winningMarks").setAttribute("stroke", "#080");
				document.getElementById("winningMarks").setAttribute("fill", "#080");
				winners.forEach(function(winnable)
				{
					var suffix = winnable.reduce(function(previous, current) { return previous + current.toString(); }, "");
					document.getElementById("winningMark" + suffix).setAttribute("stroke-opacity", "1");
				});
			}
		},

		lost:
		{
			value: function(board)
			{
				Player.Player.prototype.lost.apply(this, board);
				var winners = board.winning.filter(function(winnable) { return board.isWinning(winnable); });
				if (document.getElementById("winningMarks").getAttribute("stroke") == "none")
				{
					redrawBoard(board);
					document.getElementById("winningMarks").setAttribute("stroke", "#800");
					document.getElementById("winningMarks").setAttribute("fill", "#800");
					winners.forEach(function(winnable)
					{
						var suffix = winnable.reduce(function(previous, current) { return previous + current.toString(); }, "");
						document.getElementById("winningMark" + suffix).setAttribute("stroke-opacity", "1");
					});
				}
			}
		},

		draw:
		{
			value: function(board)
			{
				this.redrawBoard(board);
				Player.Player.prototype.draw.apply(this, board);
				document.getElementById("OMarker").setAttribute("stroke", "#C0C0C0");
				document.getElementById("XMarkerLines").setAttribute("stroke", "#C0C0C0");
			}
		}
	});

	exports.SvgPlayer = SvgPlayer;

	document.addEventListener("DOMContentLoaded",
	function()
	{
		new Game.Game(new SvgPlayer(Board.Cell.X), new Player.RandomPlayer(Board.Cell.O));
	});
})(typeof exports === "undefined" ? this.SvgUi = {} : exports, Board, Player, Game);