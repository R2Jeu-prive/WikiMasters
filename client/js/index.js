$(document).ready(function() {
	pseudo = "";
	socket.on("setPseudo", (data) => {
		pseudo = data.pseudo;
		console.log(pseudo);
	});
	socket.on("disconnect", () => {
		location.reload();
	})
});