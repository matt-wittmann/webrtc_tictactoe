(function(window, navigator)
{
	"use strict";

	if (!window.RTCPeerConnection)
	{
		if (mozRTCPeerConnection)
		{
			window.RTCPeerConnection = mozRTCPeerConnection;
		}
		else if (webkitRTCPeerConnection)
		{
			window.RTCPeerConnection = webkitRTCPeerConnection;
		}
	}

	if (!window.RTCSessionDescription)
	{
		if (mozRTCSessionDescription)
		{
			window.RTCSessionDescription = mozRTCSessionDescription;
		}
		else if (webkitRTCSessionDescription)
		{
			window.RTCSessionDescription = webkitRTCSessionDescription;
		}
	}

	if (!window.RTCIceCandidate)
	{
		if (mozRTCIceCandidate)
		{
			window.RTCIceCandidate = mozRTCIceCandidate;
		}
		else if (webkitRTCSessionDescription)
		{
			window.RTCIceCandidate = webkitRTCIceCandidate;
		}
	}

	if (!navigator.getUserMedia)
	{
		if (navigator.mozGetUserMedia)
		{
			navigator.getUserMedia = navigator.mozGetUserMedia;
		}
		else if (navigator.webkitGetUserMedia)
		{
			navigator.getUserMedia = navigator.webkitGetUserMedia;
		}
	}
})(window, navigator);