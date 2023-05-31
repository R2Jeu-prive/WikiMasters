//Browse("Londres");
let peeking;

$(".wikipedia").on("click", function(e){
    e.preventDefault();
    if(e.target.href !== undefined){
        let page = e.target.href.split("/");
        Browse("https://fr.wikipedia.org/w/api.php?origin=*&action=parse&format=json&prop=text|title&formatversion=latest&page=" + page[page.length-1], true);
    }
})

$(document).ready(function() {
    let pathfind;
    peeking = false;
	socket.on("pathfind", (data) => {
        pathfind = data;
        $(".wikipedia").addClass("loading");
        Browse("https://fr.wikipedia.org/w/api.php?origin=*&action=parse&format=json&prop=text|title&formatversion=latest&pageid=" + pathfind.start.id);
        $(".screen").each(function(){
			if($(this).attr('id') == "browse-screen"){
				$(this).removeClass("hidden-screen");
			}else{
				$(this).addClass("hidden-screen");
			}
		})
        $("#browse-screen .wikipedia-css").prop( "disabled", false );
		$("#browse-screen .start").text(pathfind.start.title);
        $("#browse-screen .end").text(pathfind.end.title);
        $("#browse-screen .time").text("3:00");
    })

    socket.on("pathTime", (data) => {
        SetPathTime(data.time, data.running);
    })

    $("#browse-screen .reset").on("click", function(){
        $(".wikipedia").addClass("loading");
        Browse("https://fr.wikipedia.org/w/api.php?origin=*&action=parse&format=json&prop=text|title&formatversion=latest&pageid=" + pathfind.start.id);
        peeking = false;
        $("#browse-screen .wikipedia").removeClass("peeking");
        $("#browse-screen .peek").removeClass("peeking");
        socket.emit("pathreset");
    });

    $("#browse-screen .peek").on("click", function(){
        $(".wikipedia").addClass("loading");
        Browse("https://fr.wikipedia.org/w/api.php?origin=*&action=parse&format=json&prop=text|title&formatversion=latest&pageid=" + pathfind.end.id);
        peeking = true;
        $("#browse-screen .wikipedia").addClass("peeking");
        $("#browse-screen .peek").addClass("peeking");
        socket.emit("pathreset");
    });
});

let pathTimeoutId = -1;
function SetPathTime(time, running){
    $("#browse-screen .time").text(parseTime(time, true));
    if(running && time != 0){
        pathTimeoutId = setTimeout(SetPathTime.bind(null, time-1000, true), 1000);
        $("#browse-screen .time").addClass("running");
    }
    if(pathTimeoutId != -1 && !running){
        clearTimeout(pathTimeoutId);
        $("#browse-screen .time").removeClass("running");
    }
}


function Browse(url, sendServer){
    fetch(url).then(function(response) {
        return response.json();
    }).then(function(data) {
        $(".wikipedia").html("<div class='bigger'></div>" + data.parse.text);
        $(".mw-parser-output").prepend("<h1 class='title'>" + data.parse.title + "</h1>");
        $(".wikipedia").scrollTop(0);
        if(sendServer && !peeking){
            socket.emit("pathstep", {title : data.parse.title, id : data.parse.pageid});
        }
        $(".wikipedia").removeClass("loading");
    }).catch(function(err) {
        console.log('Fetch Error :-S', err);
        $(".wikipedia").removeClass("loading");
    });
}