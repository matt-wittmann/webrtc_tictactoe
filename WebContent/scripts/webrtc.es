(function(window, navigator)
{
	"use strict";

	if (!window.RTCPeerConnection || !window.RTCPeerConnection.apply)
	{
		if (window.mozRTCPeerConnection)
		{
			window.RTCPeerConnection = window.mozRTCPeerConnection;
		}
		else if (window.webkitRTCPeerConnection)
		{
			window.RTCPeerConnection = window.webkitRTCPeerConnection;
		}
	}

	if (!window.RTCSessionDescription || !window.RTCSessionDescription.apply)
	{
		if (window.mozRTCSessionDescription)
		{
			window.RTCSessionDescription = window.mozRTCSessionDescription;
		}
		else if (window.webkitRTCSessionDescription)
		{
			window.RTCSessionDescription = window.webkitRTCSessionDescription;
		}
	}

	if (!window.RTCIceCandidate || !window.RTCIceCandidate.apply)
	{
		if (window.mozRTCIceCandidate)
		{
			window.RTCIceCandidate = window.mozRTCIceCandidate;
		}
		else if (window.webkitRTCSessionDescription)
		{
			window.RTCIceCandidate = window.webkitRTCIceCandidate;
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