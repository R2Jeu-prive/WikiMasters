$(document).ready(function() {
	socket.on("end", (data) => {
		$("#end-screen .lobby").attr("hidden",!data.isHost);
        
        $("#end-screen .table").empty();
        $("#end-screen .table").append("<tr class='header'></tr>")
        $("#end-screen .header").append("<th></th>")
        for(let [i, playerScore] of data.scores[0].entries()){
            if(i == 0){continue;}
            $("#end-screen .header").append("<th>Q" + i + "</th>")
        }
        $("#end-screen .header").append("<th>Total<th>")

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

        for(let [i, playerScores] of data.scores.entries()){
            $("#end-screen .table").append("<tr id='player" + i + "'></tr>")
            let totalScore = 0;
            for(let [j, playerScore] of playerScores.entries()){
                if(typeof(playerScore) == "number"){
                    totalScore += playerScore;
                    playerScore = (playerScore/1000) + "s";
                }
                $("#player" + i).append("<td>" + playerScore + "</td>")
            }
            $("#player" + i).append("<td>" + (totalScore/1000) + "s</td>")
        }

        $("#correction-screen").addClass("hidden-screen");
        $("#end-screen").removeClass("hidden-screen");
	})

	$("#end-screen .lobby").on("click", function(){
		socket.emit("reset");
	})
});