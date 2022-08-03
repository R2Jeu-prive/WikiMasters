$(document).ready(function() {
	socket.on("question", (data) => {
		console.log(data)
		$(".screen").each(function(){
			if($(this).attr('id') == "question-screen"){
				$(this).removeClass("hidden-screen");
			}else{
				$(this).addClass("hidden-screen");
			}
		})
		$("#question-screen .description").text("... " + data.description + " ...");
		$("#1").text(data.titles[0]);
		$("#2").text(data.titles[1]);
		$("#3").text(data.titles[2]);
		$("#4").text(data.titles[3]);
		$("#5").text(data.titles[4]);
		$("#6").text(data.titles[5]);
	})

	$("#question-screen .button").on("click", function(){
		console.log($(this).text());
		socket.emit("answer", $(this).text());
		$("#question-screen").addClass("hidden-screen");
	})
});