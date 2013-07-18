(function(exports, board, player, game)
{
	"use strict";

	function RemotePlayer(xo, peerConnection, dataChannel)
	{
		Player.Player.call(xo);
		this.xo = xo;
		this.peerConnection = peerConnection;
		this.dataChannel = dataChannel;
//		this.dataChannel = peerConnection.createDataChannel("webrtc-tictactoe"); // TODO Sender
//		peerConnection.ondatachannel = function(event)
//		{
////			this.dataChannel = event.target;
//			this.dataChannel = event.channel;
//			// TODO Receiver
//		};
	}

	RemotePlayer.prototype = Object.create(Player.Player.prototype,
	{
		convert:
		{
			value: function(board, data)
			{
				var newCells = null;
				if (typeof data === "string")
				{
//					var newCells = data.map(function(c) {Number(c)});
					if (data.length == 10)
					{
						if (Number(data[0]) != board.other(this.xo))
						{
							throw Error("The other play still thinks it's their turn! CHEATER!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
						}
						newCells = [];
						for (var i = 1; i < data.length; i++)
						{
							newCells.push(Number(data[i]));
						}
					}
				}
				return newCells;
			}
		},
		ask:
		{
			value: function(board, callback)
			{
				this.turn = Player.Turn.OWN;
				this.dataChannel.onmessage = function(event)
				{
					var newCells = this.convert(board, event.data);
					if (newCells != null)
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
							board.mark(this.xo, diffs[0][0]);
						}
					}
				};
				this.turn = Player.Turn.OTHER;
			}
		}
	});
})(typeof exports === "undefined" ? this.RemotePlayer = {} : exports, Board, Player, Game);