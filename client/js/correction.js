$(document).ready(function() {
	socket.on("correction", (data) => {
		console.log(data)
        if(data.answer == ""){
            $("#correction-screen .my-answer").text("Temps écoulé (+10s)")
        }else{
            $("#correction-screen .my-answer").text(data.answer + " est " + (data.time == 10000 ? "FAUX (+10s)" : ("VRAI (+" + data.time/1000 + "s)")))
        }
		if(data.time == 10000){
			$("#correction-screen .my-answer").addClass("my-answer-wrong");
			$("#correction-screen .my-answer").removeClass("my-answer-right");
            correct = false;
		}else{
			$("#correction-screen .my-answer").removeClass("my-answer-wrong");
			$("#correction-screen .my-answer").addClass("my-answer-right");
            correct = true;
		}
		$("#correction-screen .correction").text("Correction Q" + data.questionProgression[0] + " : " + data.correction);
        $("#correction-screen .link").each(function(i){
            $(this).text("Wiki : " + data.pages[i].title);
            $(this).attr("href","http://fr.wikipedia.org/?curid=" + data.pages[i].id);
		})
		$("#correction-screen .next-question").attr("hidden",!data.isHost);
		$("#correction-screen .scoreboard").empty();
		let shownPlayers = []
		for (let playerScores of data.scores) {
			let total = 0;
			for (let [i, playerScore] of playerScores.entries()) {
				if(i == 0){
					continue;
				}
				total += playerScore;
			}
			shownPlayers.push([-1, playerScores[0], total, playerScores[playerScores.length - 1]]);
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
        /*
		for (let i = shownPlayers.length-1; i >= 0; i--) {
			if(shownPlayers[i][0] > 3 && shownPlayers[i][1] != pseudo){
				shownPlayers.splice(i, 1);
			}
		}*/
		for (let shownPlayer of shownPlayers) {
            if(shownPlayer[3] == 10000){
                $("#correction-screen .scoreboard").append("<li class='player'>" + shownPlayer[0] + ") " + shownPlayer[1] + " " + parseTime(shownPlayer[2]) + " <i class='fa-solid fa-xmark'></i>")
            }else{
                $("#correction-screen .scoreboard").append("<li class='player'>" + shownPlayer[0] + ") " + shownPlayer[1] + " " + parseTime(shownPlayer[2]) + " <i class='fa-solid fa-check'></i><p class='small-time'>(" + parseTime(shownPlayer[3]) +  ")</p>")
            }
			
		}
        if(data.questionProgression[0] == data.questionProgression[1]){
            $("#correction-screen .next-question").text("Résultats");
        }else{
            $("#correction-screen .next-question").text("Question " + (data.questionProgression[0] + 1));
        }
        $(".screen").each(function(){
			if($(this).attr('id') == "correction-screen"){
				$(this).removeClass("hidden-screen");
                $(this).scrollTop(0);
			}else{
				$(this).addClass("hidden-screen");
			}
		})
	})

	$("#correction-screen .next-question").on("click", function(){
		socket.emit("nextQuestion");
		$("#correction-screen").addClass("hidden-screen");
        $("#loading-screen").removeClass("hidden-screen");
	})
});