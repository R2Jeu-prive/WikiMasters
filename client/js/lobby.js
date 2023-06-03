$(document).ready(function() {
    UpdateLobbyInfo($("#lobby-screen .mode-select").val(), $("#lobby-screen .toggle-open input").prop("checked"));
	socket.on("refreshLobby", (data) => {
		$("#lobby-screen .title").text("Lobby " + data.tag + ((data.isHost) ? " (host)" : ""));
		$("#lobby-screen .player-list").empty();
		for (let player of data.playerList) {
			$("#lobby-screen .player-list").append("<li class='player'>" + player + "</li>")
		}
		$("#lobby-screen .start-game").attr("hidden",!data.isHost);
        $("#lobby-screen .toggle-open .toggle").attr("hidden", !data.isHost);
        $("#lobby-screen .mode-select").attr("disabled", !data.isHost);
        $("#loading-screen").addClass("hidden-screen");
        $("#end-screen").addClass("hidden-screen");
        $("#lobby-screen").removeClass("hidden-screen");
	})

	$("#lobby-screen .start-game").on("click", function(){
		socket.emit("startGame");
	})

    $("#lobby-screen .quit-game").on("click", function(){
		location.reload();
	})

    $("#lobby-screen .mode-select").on("change", function(){
        UpdateLobbyInfo($("#lobby-screen .mode-select").val(), $("#lobby-screen .toggle-open input").prop("checked"));
    })

    $("#lobby-screen .toggle-open input").on("change", function(){
        UpdateLobbyInfo($("#lobby-screen .mode-select").val(), $("#lobby-screen .toggle-open input").prop("checked"));
    })
});

function UpdateLobbyInfo(mode, open){
    let info = "";
    if(mode == "short"){
        info = "Mode de jeu d'environ 15min. La partie commence par 10 questions titre pour finir sur une navigation dans wikipedia qui peut renverser la partie !";
    }else if(mode == "long"){
        info = "Mode de jeu d'environ 40min. Être chanceux ne suffira pas : c'est le talent qui fera la différence ! On joue 10 questions et 1 navigation. Puis de nouveau 10 questions et un sprint final de 2 navigations !";
    }else if(mode == "title"){
        info = "Mode de jeu d'environ 10min. Permet de découvrir et de perfectionner les questions en mode titre (5 questions). Le but du jeu est de retrouver le titre d'une page wikipedia à partir de sa première phrase seulement. Mais attention : le temps presse !";
    }else if(mode == "pathfind"){
        info = "Mode de jeu d'environ 10min. Permet de découvrir et de perfectionner les navigations sur Wikipedia. Le but du jeu est de naviguer de lien en lien d'une page de départ à une page d'arrivée. Soyez méthodique !";
    }
    $("#lobby-screen .mode-info").text(info);
    $("#lobby-screen .toggle-open input").prop("checked",open);
}