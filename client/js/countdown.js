$(document).ready(function() {
	socket.on("countdown", (number) => {
		$("#countdown-screen .number").text(number);
        $("#lobby-screen").addClass("hidden-screen");
        $("#loading-screen").addClass("hidden-screen");
        $("#correction-screen").addClass("hidden-screen");
        $("#countdown-screen").removeClass("hidden-screen");
	})
});