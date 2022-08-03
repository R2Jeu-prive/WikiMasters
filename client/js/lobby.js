$(document).ready(function() {
	socket.on("refreshLobby", (data) => {
		$("#lobby-screen .title").text("Lobby " + data.tag + ((data.isHost) ? " (host)" : ""));
		$("#lobby-screen .player-list").empty();
		for (let player of data.playerList) {
			$("#lobby-screen .player-list").append("<li class='player'>" + player + "</li>")
		}
		$("#lobby-screen .start-game").attr("hidden",!data.isHost);
	})

	$("#lobby-screen .start-game").on("click", function(){
		socket.emit("startGame");
	})
});