$(document).ready(function() {
	socket.on("correction", (data) => {
		console.log(data)
		$(".screen").each(function(){
			if($(this).attr('id') == "correction-screen"){
				$(this).removeClass("hidden-screen");
			}else{
				$(this).addClass("hidden-screen");
			}
		})
        if(data.answer == ""){
            $("#correction-screen .my-answer").text("Temps écoulé (+10s)")
        }else{
            $("#correction-screen .my-answer").text(data.answer + " est " + (data.time == 10000 ? "FAUX (+10s)" : ("VRAI (+" + data.time/1000 + "s)")))
        }
		if(data.time == 10000){
			$("#correction-screen .my-answer").addClass("my-answer-wrong");
			$("#correction-screen .my-answer").removeClass("my-answer-right");
		}else{
			$("#correction-screen .my-answer").removeClass("my-answer-wrong");
			$("#correction-screen .my-answer").addClass("my-answer-right");
		}
		$("#correction-screen .correction").text("Correction : " + data.correction);
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
		}
	})

	$("#correction-screen .next-question").on("click", function(){
		socket.emit("nextQuestion");
		$("#correction-screen").addClass("hidden-screen");
        $("#loading-screen").removeClass("hidden-screen");
	})
});