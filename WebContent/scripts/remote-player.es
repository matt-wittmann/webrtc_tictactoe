(function(exports, board, player, game)
{
	"use strict";

	var HEARTBEAT = 524288;

	function RemotePlayer(xo, dataChannel)
	{
		Player.Player.call(xo);
		this.xo = xo;
		this.dataChannel = dataChannel;
	}

	RemotePlayer.prototype = Object.create(Player.Player.prototype,
	{
		convert:
		{
			value: function(board, data, callback)
			{
				var reader = new FileReader();
				var player = this;
				reader.onload = function()
				{
					var typedArray = new Uint32Array(this.result);
					if (typedArray.length == 1)
					{
						var encoded = typedArray[0];
						if (encoded != HEARTBEAT)
						{
							var newBoard = new Board.Board(encoded);
							if (newBoard.turn != board.other(player.xo))
							{
								throw Error("The other play still thinks it's their turn! CHEATER!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
							}
							callback(newBoard.cells);
						}
					}
					else
					{
						throw Error("Unexpected data buffer size sent from remote player: " + typedArray.length);
					}
				};
				reader.readAsArrayBuffer(data);
			}
		},
		ask:
		{
			value: function(board, callback)
			{
				this.turn = Player.Turn.OWN;
				this.dataChannel.send(new Blob([new Uint32Array([board.encode()]).buffer]));
				var player = this;
				this.dataChannel.onmessage = function(event)
				{
					player.convert(board, event.data, function(newCells)
					{
						var diffs = [];
						for (var i = 0; i < newCells.length; i++)
						{
							if (board.cells[i] != newCells[i])
							{
								if (board.cells[i] != Board.Cell.FREE)
								{
									throw Error("Space was not free! CHEATER!!!!!!!!!!!!!!!!!!!!!!!!!!");
								}
								else
								{
									diffs.push([i, newCells[i]]);
								}
							}
						}
						if (diffs.length != 1)
						{
							throw Error("More than one move? CHEATER!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
						}
						else
						{
							board.mark(player.xo, diffs[0][0]);
							player.turn = Player.Turn.OTHER;
							callback();
						}
					});
				};
			}
		}
	});

	exports.RemotePlayer = RemotePlayer;
	exports.HEARTBEAT = HEARTBEAT;
})(typeof exports === "undefined" ? this.RemotePlayer = {} : exports, Board, Player, Game);