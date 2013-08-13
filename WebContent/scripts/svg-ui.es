(function(exports, Board, Player, RemotePlayer, Game)
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
					redrawBoard(board);
					callback();
				}
				else
				{
					throw Error("The space (" + x + ", " + y + ") is not free.");
				}
			}
		},

		makeSpaceClickedHandler:
		{
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
				redrawBoard(board);
				Player.Player.prototype.draw.apply(this, board);
				document.getElementById("OMarker").setAttribute("stroke", "#C0C0C0");
				document.getElementById("XMarkerLines").setAttribute("stroke", "#C0C0C0");
			}
		}
	});

	function showBoard()
	{
		var setup = document.getElementById("setup");
		var theBoard = document.getElementById("theBoard");
		setup.setAttribute("display", "none");
		theBoard.setAttribute("display", "inline");
	}

	function showOfferOrAnswer()
	{
		 var webrtc = document.getElementById("webrtc");
		 var offerOrAnswer = document.getElementById("offerOrAnswer");
		 webrtc.setAttribute("display", "none");
		 offerOrAnswer.setAttribute("display", "inline");
	}

	function logWebRtcError(error)
	{
		console.error(error.name + ": " + error.message);
	}

	function setUpDataChannel(channel, offerer)
	{
		var interval = {id: null};
		channel.onopen = function()
		{
			console.log("Data channel opened.");
			interval.id = window.setInterval(function()
			{
				if (channel != null && channel.readyState == "open")
				{
					channel.send(new Blob([new Uint32Array([RemotePlayer.HEARTBEAT]).buffer]));
				}
			}, 1000);
			showBoard();
			var playerX = offerer ? new SvgPlayer(Board.Cell.X) : new RemotePlayer.RemotePlayer(Board.Cell.X, channel);
			var playerY = offerer ? new RemotePlayer.RemotePlayer(Board.Cell.O, channel) : new SvgPlayer(Board.Cell.O);
			new Game.Game(playerX, playerY);
		};
		channel.onclose = function() {console.log("Data channel closed."); window.clearInterval(interval.id);};
		channel.onerror = function(event) {console.error("Data channel error: " + event);};
		channel.onmessage = function(event) {console.log(event.data);};
		return channel;
	}

	function initializeWebRtc(offerer)
	{
		function setLocalDescription(description)
		{
			peerConnection.setLocalDescription(description, function()
			{
				console.log("Local description set.");
				var nodeId = offerer ? "offer" : "answer";
				var stringDescription = JSON.stringify(description);
				var offerNode = document.createTextNode(stringDescription);
				document.getElementById(nodeId).appendChild(offerNode);
				window.prompt("Copy your " + nodeId + " and send it to a friend to play against.", stringDescription);
				if (offerer)
				{
					var remoteAnswer = window.prompt("Paste in the answer to your offer.");
					peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(remoteAnswer)), function()
					{
						var answerNode = document.createTextNode(remoteAnswer);
						document.getElementById("answer").appendChild(answerNode);
					}, logWebRtcError);
				}
			}, logWebRtcError);
		}

		var configuration = {"iceServers": [{"url": "stun:stunserver.org"}]};
		var mediaConstraints = {"optional": [{ "RtpDataChannels": true }]};
		var peerConnection = new RTCPeerConnection(configuration, mediaConstraints);
		var channel = null;
		var iceCandidate = null;
		peerConnection.onclosedconnection = function() {console.log("RTCPeerConnection has closed.");};
		peerConnection.onicecandidate = function(event)
		{
			iceCandidate = event.candidate;
			if (!offerer && iceCandidate != null)
			{
				peerConnection.addIceCandidate(iceCandidate);
			}
		};
		peerConnection.onaddstream = function(event)
		{
			console.log("Incoming media stream detected.");
		};
		peerConnection.onconnection = function(event)
		{
			console.log("Connection opened.");
		};
		peerConnection.ondatachannel = function(event)
		{
			console.log("Data channel connection received.");
			channel = setUpDataChannel(event.channel, offerer);
		};
		peerConnection.onnegotiationneeded = function()
		{
			peerConnection.createOffer(setLocalDescription, logWebRtcError);
		};

		navigator.getUserMedia({audio: true, video: false, fake: true}, function(stream)
		{
			if (offerer)
			{
				peerConnection.addStream(stream);
				channel = setUpDataChannel(peerConnection.createDataChannel("data", {reliable: true}), offerer);
				peerConnection.createOffer(setLocalDescription, logWebRtcError);
			}
			else
			{
				var remoteOffer = window.prompt("Paste in the offer.");
				var offerNode = document.createTextNode(remoteOffer);
				document.getElementById("offer").appendChild(offerNode);
				peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(remoteOffer)), function()
				{
					peerConnection.createAnswer(setLocalDescription, logWebRtcError);
				}, logWebRtcError);
			}
		}, logWebRtcError);
	}

	exports.SvgPlayer = SvgPlayer;

	document.addEventListener("DOMContentLoaded",
	function()
	{
		[
		 {
			 label: "Local",
			 handler: function(event)
			 {
				 showBoard();
				 new Game.Game(new SvgPlayer(Board.Cell.X), new SvgPlayer(Board.Cell.O));
			 }
		 },
		 {
			 label: "Computer",
			 handler: function(event)
			 {
				 showBoard();
				 new Game.Game(new SvgPlayer(Board.Cell.X), new Player.RandomPlayer(Board.Cell.O));
			 }
		 },
		 {
			 label: "Remote",
			 handler: function(event)
			 {
				 var setup = document.getElementById("setup");
				 var webrtc = document.getElementById("webrtc");
				 setup.setAttribute("display", "none");
				 webrtc.setAttribute("display", "inline");
			 }
		 },
		 {
			 label: "Offer",
			 handler: function(event)
			 {
				 showOfferOrAnswer();
				 initializeWebRtc(true);
			 }
		 },
		 {
			 label: "Answer",
			 handler: function(event)
			 {
				 showOfferOrAnswer();
				 initializeWebRtc(false);
			 }
		 }
		].forEach(function(handlerHash)
		{
			var id = "label_" + handlerHash.label;
			var element = document.getElementById(id);
			element.addEventListener("click", handlerHash.handler);
		});
	});
})(typeof exports === "undefined" ? this.SvgUi = {} : exports, Board, Player, RemotePlayer, Game);