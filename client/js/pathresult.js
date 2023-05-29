$(document).ready(function() {
	socket.on("pathresult", (data) => {
        //Show correct result for the player
        if(data.time == 20000){
            $("#pathresult-screen .my-result").text("Temps écoulé (+20s)")
            $("#pathresult-screen .my-result").addClass("my-result-wrong");
			$("#pathresult-screen .my-result").removeClass("my-result-right");
            $("#pathresult-screen .my-result").removeClass("my-result-king");
        }else if(data.time == -10000){
            $("#pathresult-screen .my-result").text("Chemin trouvé à temps (-10s)")
            $("#pathresult-screen .my-result").removeClass("my-result-wrong");
			$("#pathresult-screen .my-result").addClass("my-result-right");
            $("#pathresult-screen .my-result").removeClass("my-result-king");
        }else{
            $("#pathresult-screen .my-result").text("Chemin trouvé en premier (-20s)")
            $("#pathresult-screen .my-result").removeClass("my-result-wrong");
			$("#pathresult-screen .my-result").removeClass("my-result-right");
            $("#pathresult-screen .my-result").addClass("my-result-king");
        }
		$("#pathresult-screen .next-question").attr("hidden",!data.isHost);
		$("#pathresult-screen .scoreboard").empty();
		let shownPlayers = []
		for (let playerScores of data.scores) {
			let total = 0;
			for (let [i, playerScore] of playerScores.entries()) {
				if(i == 0){
					continue;
				}
				total += playerScore;
			}
			shownPlayers.push([-1, playerScores[0], total, playerScores[playerScores.length - 1]]);//Set list of : rank, name, totalScore, lastScore (which tells which icon)
		}

        //order the players by total score
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
        //splice to limit list length
		/*for (let i = shownPlayers.length-1; i >= 0; i--) {
			if(shownPlayers[i][0] > 3 && shownPlayers[i][1] != pseudo){
				shownPlayers.splice(i, 1);
			}
		}*/
		for (let shownPlayer of shownPlayers) {
            if(shownPlayer[3] == 20000){
                $("#pathresult-screen .scoreboard").append("<li class='player'>" + shownPlayer[0] + ") " + shownPlayer[1] + " " + parseTime(shownPlayer[2]) + " <i class='fa-solid fa-xmark'></i>")
            }else if(shownPlayer[3] == -10000){
                $("#pathresult-screen .scoreboard").append("<li class='player'>" + shownPlayer[0] + ") " + shownPlayer[1] + " " + parseTime(shownPlayer[2]) + " <i class='fa-solid fa-check'></i></li>")
            }else{
                $("#pathresult-screen .scoreboard").append("<li class='player'>" + shownPlayer[0] + ") " + shownPlayer[1] + " " + parseTime(shownPlayer[2]) + " <i class='fa-solid fa-crown'></i></li>")
            }
			
		}
        if(data.questionProgression[0] == data.questionProgression[1]){
            $("#pathresult-screen .next-question").text("Résultats");
        }else{
            $("#pathresult-screen .next-question").text("Question " + (data.questionProgression[0] + 1));
        }
        $(".screen").each(function(){
			if($(this).attr('id') == "pathresult-screen"){
				$(this).removeClass("hidden-screen");
                $(this).scrollTop(0);
			}else{
				$(this).addClass("hidden-screen");
			}
		})
	})

	$("#pathresult-screen .next-question").on("click", function(){
		socket.emit("nextQuestion");
		$("#pathresult-screen").addClass("hidden-screen");
        $("#loading-screen").removeClass("hidden-screen");
	})
});