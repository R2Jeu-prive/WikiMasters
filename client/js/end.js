$(document).ready(function() {
	socket.on("end", (data) => {
		$("#end-screen .lobby").attr("hidden",!data.isHost);
        
        $("#end-screen .table").empty();
        $("#end-screen .table").append("<tr class='header'></tr>")
        for(let [i, playerScores] of data.scores.entries()){
            $("#end-screen .table").append("<tr id='player" + i + "'></tr>")
            for(let [j, playerScore] of playerScores.entries()){
                $("#player" + i).append("<td>" + playerScore + "</td>")
            }
        }




		/*let shownPlayers = []
		for (let playerScores of data.scores) {
			let total = 0;
			for (let [i, playerScore] of playerScores.entries()) {
				if(i == 0){
					continue;
				}
				total += playerScore;
			}
			shownPlayers.push([-1, playerScores[0], total]);
		}
		while(true){
			let sorted = true;
			for (let i = 0; i < shownPlayers.length-1; i++) {
				if(shownPlayers[i][2] > shownPlayers[i+1][2]){
					sorted = false;
					let temp = shownPlayers[i];
					shownPlayers[i] = shownPlayers[i+1];
					shownPlayers[i+1] = temp;
				}
			}
			if(sorted){
				break;
			}
		}
		for (let [i, shownPlayer] of shownPlayers.entries()) {
			shownPlayer[0] = 1+i;
		}
		for (let i = shownPlayers.length-1; i >= 0; i--) {
			if(shownPlayers[i][0] > 3 && shownPlayers[i][1] != pseudo){
				shownPlayers.splice(i, 1);
			}
		}
		for (let shownPlayer of shownPlayers) {
			let min = Math.floor(shownPlayer[2]/60000);
			let sec = ("0" + (Math.floor((shownPlayer[2]%60000)/1000))).slice(-2);
			let mil = ("00" + (shownPlayer[2]%1000)).slice(-3);
			let time = min + ":" + sec + "." + mil;
			$("#correction-screen .scoreboard").append("<li class='player'>" + shownPlayer[0] + ") " + shownPlayer[1] + " " + time + "</li>")
		}*/

        $("#correction-screen").addClass("hidden-screen");
        $("#end-screen").removeClass("hidden-screen");
	})

	$("#end-screen .lobby").on("click", function(){
		socket.emit("reset");
	})
});