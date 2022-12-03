$(document).ready(function() {
	socket.on("refreshLobby", (data) => {
		$("#lobby-screen .title").text("Lobby " + data.tag + ((data.isHost) ? " (host)" : ""));
		$("#lobby-screen .player-list").empty();
		for (let player of data.playerList) {
			$("#lobby-screen .player-list").append("<li class='player'>" + player + "</li>")
		}
		$("#lobby-screen .start-game").attr("hidden",!data.isHost);
        $("#lobby-screen .host-panel").attr("hidden",!data.isHost);
        $("#loading-screen").addClass("hidden-screen");
        $("#end-screen").addClass("hidden-screen");
        $("#lobby-screen").removeClass("hidden-screen");
	})

	$("#lobby-screen .start-game").on("click", function(){
		socket.emit("startGame");
	})
});