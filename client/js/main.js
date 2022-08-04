$(document).ready(function() {
    $("#main-screen .create-game").on("click", function(){
		let wantedPseudo = $("#main-screen .pseudo").val();
        $("#main-screen").addClass("hidden-screen");
		socket.emit("changePseudo", {pseudo : wantedPseudo}, (accepted) => {
			if(accepted){
				socket.emit("createGame", (created) => {
					if(!created){
                        $("#error-screen .message").text("Impossible de créer une partie pour le moment");
                        $("#error-screen").removeClass("hidden-screen");
                    }
				})
			}else{
                $("#error-screen .message").text("Ce pseudo n'est pas valide");
                $("#error-screen").removeClass("hidden-screen");
            }
		});
	});
	$("#main-screen .join-game").on("click", function(){
		let wantedPseudo = $("#main-screen .pseudo").val();
		let joinTag = $("#main-screen .gametag").val();
        $("#main-screen").addClass("hidden-screen");
		socket.emit("changePseudo", {pseudo : wantedPseudo}, (accepted) => {
			if(accepted){
				socket.emit("joinGame", joinTag, (joined) => {
					if(!joined){
                        $("#error-screen .message").text("Ce TAG ne correspond à aucun lobby");
                        $("#error-screen").removeClass("hidden-screen");
                    }
				})
			}else{
                $("#error-screen .message").text("Ce pseudo n'est pas valide");
                $("#error-screen").removeClass("hidden-screen");
            }
		});
	});
});