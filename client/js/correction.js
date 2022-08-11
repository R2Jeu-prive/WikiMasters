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
			shownPlayers.push([-1, playerScores[0], total, playerScores[playerScores.length - 1] != 10000]);
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
            if(shownPlayer[3]){
                $("#correction-screen .scoreboard").append("<li class='player'>" + shownPlayer[0] + ") " + shownPlayer[1] + " " + time + " <svg class='icon-right' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'><path d='M438.6 105.4C451.1 117.9 451.1 138.1 438.6 150.6L182.6 406.6C170.1 419.1 149.9 419.1 137.4 406.6L9.372 278.6C-3.124 266.1-3.124 245.9 9.372 233.4C21.87 220.9 42.13 220.9 54.63 233.4L159.1 338.7L393.4 105.4C405.9 92.88 426.1 92.88 438.6 105.4H438.6z'/></svg></li>")
            }else{
                $("#correction-screen .scoreboard").append("<li class='player'>" + shownPlayer[0] + ") " + shownPlayer[1] + " " + time + " <svg class='icon-wrong' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 512'><path d='M310.6 361.4c12.5 12.5 12.5 32.75 0 45.25C304.4 412.9 296.2 416 288 416s-16.38-3.125-22.62-9.375L160 301.3L54.63 406.6C48.38 412.9 40.19 416 32 416S15.63 412.9 9.375 406.6c-12.5-12.5-12.5-32.75 0-45.25l105.4-105.4L9.375 150.6c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L160 210.8l105.4-105.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-105.4 105.4L310.6 361.4z'/></svg></li>")
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