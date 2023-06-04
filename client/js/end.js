$(document).ready(function() {
	socket.on("end", (data) => {
		$("#end-screen .lobby").attr("hidden",!data.isHost);
        
        $("#end-screen .table").empty();
        $("#end-screen .table").append("<tr class='header'></tr>")
        $("#end-screen .header").append("<th class='cells'>Joueurs</th>")
        for(let [i, playerScore] of data.scores[0].entries()){
            if(i == 0){continue;}
            $("#end-screen .header").append("<th class='cells'>Q" + i + "</th>")
        }
        $("#end-screen .header").append("<th class='cells'>Total</th>")

        while(true){
			let sorted = true;
			for (let i = 0; i < data.scores.length-1; i++) {
                let sumA = 0;
                let sumB = 0;
                for (let j = 1; j < data.scores[i].length; j++) {
                    sumA += data.scores[i][j];
                    sumB += data.scores[i+1][j];
                }
				if(sumA > sumB){
					sorted = false;
                    data.scores.push(data.scores.splice(i,1)[0])
                    break;
				}
			}
			if(sorted){
				break;
			}
		}

        $("#end-screen .winner").text(data.scores[0][0] + " est Champion de WikiMasters !")

        for(let [i, playerScores] of data.scores.entries()){
            $("#end-screen .table").append("<tr id='player" + i + "'></tr>")
            let totalScore = 0;
            for(let [j, playerScore] of playerScores.entries()){
                if(typeof(playerScore) == "number"){
                    totalScore += playerScore;
                    playerScore = (playerScore/1000) + "s";
                }
                $("#player" + i).append("<td class='cells'>" + playerScore + "</td>")
            }
            let min = Math.floor(totalScore/60000);
			let sec = ("0" + (Math.floor((totalScore%60000)/1000))).slice(-2);
			let mil = ("00" + (totalScore%1000)).slice(-3);
			let time = min + ":" + sec + "." + mil + "s";
            $("#player" + i).append("<td class='cells'>" + time + "</td>")
        }

        $("#correction-screen").addClass("hidden-screen");
        $("#pathresult-screen").addClass("hidden-screen");
        $("#loading-screen").addClass("hidden-screen");
        $("#end-screen").removeClass("hidden-screen");
	})

	$("#end-screen .lobby").on("click", function(){
		socket.emit("reset");
	})
});