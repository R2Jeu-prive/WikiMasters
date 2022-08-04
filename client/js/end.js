$(document).ready(function() {
	socket.on("end", (data) => {
		$("#end-screen .lobby").attr("hidden",!data.isHost);
        $("#correction-screen").addClass("hidden-screen");
        $("#end-screen").removeClass("hidden-screen");
	})

	$("#end-screen .lobby").on("click", function(){
		socket.emit("reset");
	})
});