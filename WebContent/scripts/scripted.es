(function(exports, Board, Player, Game)
{
	"use strict";

	if (console != undefined && console.log != undefined)
	{
		;
	}

	new Game.Game();
})(typeof exports === "undefined" ? this.board = {} : exports, Board, Player, Game);