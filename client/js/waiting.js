$(document).ready(function() {
	socket.on("wait", (time) => {
		$("#waiting-screen .time").text("Tu as répondu en " + time/1000 + "s");
        $("#waiting-screen").removeClass("hidden-screen");
	})
});