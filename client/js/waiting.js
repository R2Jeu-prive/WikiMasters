$(document).ready(function() {
	socket.on("wait", (time) => {
		$("#waiting-screen .time").text("Tu as répondu en " + time/1000 + "s");
        $("#waiting-screen").removeClass("hidden-screen");
	})

    socket.on("waitPath", (time) => {
        if(time == -20000){
            $("#waiting-screen .time").text("Tu es le premier à trouver un chemin jusqu'à l'arrivée ! (-20s)");
        }else{
            $("#waiting-screen .time").text("Tu a trouvé un chemin jusqu'à l'arrivée ! (-10s)");
        }
        $("#browse-screen .wikipedia-css").prop( "disabled", true );
        $("#browse-screen").addClass("hidden-screen");
        $("#waiting-screen").removeClass("hidden-screen");
	})
});