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

function parseTime(timeInMil){
    let time = "";
    if(timeInMil < 0){
        timeInMil = -timeInMil;
        time = "-"
    }
    let min = Math.floor(timeInMil/60000);
    let sec = ("0" + (Math.floor((timeInMil%60000)/1000))).slice(-2);
    let mil = ("00" + (timeInMil%1000)).slice(-3);
    time = time + min + ":" + sec + "." + mil;
    return time;
}