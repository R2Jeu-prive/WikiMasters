$(document).ready(function() {
    $("#main-screen .create-game").on("click", function(){
		let wantedPseudo = $("#main-screen .pseudo").val();
		socket.emit("changePseudo", {pseudo : wantedPseudo}, (accepted) => {
			if(accepted){
				$("#main-screen").addClass("hidden-screen");
				socket.emit("createGame", (created) => {
					if(created){
						setTimeout(function() {
							$("#lobby-screen").removeClass("hidden-screen");
						}, 500);
					}
				})
			}
		});
	});
	$("#main-screen .join-game").on("click", function(){
		let wantedPseudo = $("#main-screen .pseudo").val();
		let joinTag = $("#main-screen .gametag").val();
		socket.emit("changePseudo", {pseudo : wantedPseudo}, (accepted) => {
			if(accepted){
				$("#main-screen").addClass("hidden-screen");
				socket.emit("joinGame", joinTag, (joined) => {
					console.log(joined);
					if(joined){
						setTimeout(function() {
							$("#lobby-screen").removeClass("hidden-screen");
						}, 500);
					}
				})
			}
		});
	});
});