let games = [];
const Q = require("./question.js");

class Game{
	constructor(hostUser){
		this.players = [hostUser];
		this.tag = GenerateTag();
		this.answers = [];
		this.scores = [];
		this.timerRunning = false;
        this.questionTimeoutId;
		this.questionsAsked = 0;
        this.questionsTotal = 10;
		this.question = null;
        this.decoys = [];
		this.questionTime = null;
	}

    //sends all players lobby info needed
	RefreshLobby(){
		let playerList = []
		for (let player of this.players) {
			playerList.push(player.pseudo);
		}
		for (let player of this.players) {
			player.socket.emit("refreshLobby", {playerList : playerList, isHost : player.pseudo == this.players[0].pseudo, tag : this.tag});
		}
	}

    //inits gamescores and asks first question
	Start(){
		this.questionsAsked = 0;
        this.answers = [];
		this.scores = [];
		for (let player of this.players) {
			this.scores.push([]);
		}
		this.Countdown();
	}

    Countdown(){
        for (let [i, player] of this.players.entries()) {
			player.socket.emit("countdown", 3);
            setTimeout(function(){player.socket.emit("countdown", 2)}, 500);
            setTimeout(function(){player.socket.emit("countdown", 1)}, 1000);
		}
		setTimeout(this.AskQuestion.bind(this), 1500);
    }

	AskQuestion(){
		this.timerRunning = true;
		this.questionTime = Date.now();
		this.questionsAsked += 1;
		this.question = Q.Fetch();
        this.decoys = [Q.Fetch(), Q.Fetch(), Q.Fetch(), Q.Fetch(), Q.Fetch()];
		let answerPool = [this.decoys[0].title, this.decoys[1].title, this.decoys[2].title, this.decoys[3].title, this.decoys[4].title]
        answerPool.splice(Math.floor(Math.random() * 6), 0, this.question.title);

        //resets answer array and sends question to all players
		this.answers = [];
		for (let [i, player] of this.players.entries()) {
			this.answers.push("");
			this.scores[i].push(10000);
			player.socket.emit("question", {
                description : this.question.description,
                titles : answerPool
            });
		}

		this.questionTimeoutId = setTimeout(this.CorrectAnswers.bind(this), 10000);
	}

	CorrectAnswers(){
		console.log("A)" + this.scores)
		this.timerRunning = false;
		let clientScores = [] //[["playerA", 10000, 5678, 3200], ["playerB", 10000, 9994, 1002]]
		for (let [i,player] of this.players.entries()) {
            //set wrong answers to score 10s
			if(this.answers[i] != this.question.title){
				this.scores[i][this.questionsAsked-1] = 10000;
			}

            //fill in clientScores to send to front
			clientScores.push([player.pseudo])
			for (let score of this.scores[i]) {
				clientScores[i].push(score);
			}
		}
        this.decoys.unshift(this.question);
		for (let [i,player] of this.players.entries()) {
			player.socket.emit("correction", {
                answer : this.answers[i],
                time : this.scores[i][this.questionsAsked-1],
                correction : this.question.title + " " + this.question.description,
                pages : this.decoys,
                scores : clientScores,
                isHost : player.pseudo == this.players[0].pseudo,
                questionProgression : [this.questionsAsked, this.questionsTotal]
            });
		}
	}

    ShowEndScreen(){
        let clientScores = [] //[["playerA", 10000, 5678, 3200], ["playerB", 10000, 9994, 1002]]
		for (let [i,player] of this.players.entries()) {
            //set wrong answers to score 10s
			if(this.answers[i] != this.question.title){
				this.scores[i][this.questionsAsked-1] = 10000;
			}

            //fill in clientScores to send to front
			clientScores.push([player.pseudo])
			for (let score of this.scores[i]) {
				clientScores[i].push(score);
			}
		}
        for (let [i,player] of this.players.entries()) {
            player.socket.emit("end", {
                scores : clientScores,
                isHost : player.pseudo == this.players[0].pseudo
            })
        }
    }
}

function CreateGame(host){
	for (let game of games) {
		if(game.players[0].pseudo == host.pseudo){
			return false;
		}
	}
	games.push(new Game(host));
	games[games.length-1].RefreshLobby();
	console.log("CREATED GAME " + games[games.length-1].tag);
	return true;
}

function JoinGame(user, tag){
	for (let game of games) {
		for (let player of game.players) {
			if(player.pseudo == user.pseudo){
				return false;//user already in a game
			}
		}
	}
	for (let game of games) {
		if(game.tag != tag){
			continue;
		}
		game.players.push(user);
		console.log(user.pseudo + " JOINED " + game.tag);
		game.RefreshLobby();
		return true
	}
	return false;//couldn't find game with this tag
}

function ProcessStartGameRequest(socket){
	for (let game of games) {
		if(game.players[0].socket.id == socket.id){
			game.Start();
			break;
		}
	}
}

function ProcessNextQuestionRequest(socket){
	for (let game of games) {
		if(game.players[0].socket.id == socket.id){
            if(game.questionsTotal != game.questionsAsked){
                game.Countdown();   
            }else{
                game.ShowEndScreen();
            }
			return;
		}
	}
}

function ProcessAnswerRequest(socket, answer){
	for (let [i, game] of games.entries()){
		if(!game.timerRunning){
			continue;
		}
		for (let [j,gamePlayer] of game.players.entries()) {
			if(gamePlayer.socket.id == socket.id){
				game.answers[j] = answer
				game.scores[j][game.questionsAsked-1] = Date.now()-game.questionTime;
                for (let [k,gameAnswer] of game.answers.entries()) {
                    if(gameAnswer == ""){
                        socket.emit("wait", game.scores[j][game.questionsAsked-1]);
				        return;
                    }
                }
                clearTimeout(game.questionTimeoutId);
                game.CorrectAnswers();
			}
		}
	}
}

function ProcessPlayerDisconnection(player){
	for (let [i,game] of games.entries()){
		for (let [j,gamePlayer] of game.players.entries()) {
			if(gamePlayer.pseudo != player.pseudo){
				continue;
			}
			if(game.players.length == 1){
				console.log("DELETED GAME " + game.tag);
				games.splice(i, 1);
				return;
			}
			console.log(player.pseudo + " LEFT " + games[i].tag);
			game.players.splice(j, 1);
			if(game.answers.length > 0){
				game.answers.splice(j, 1);
				game.scores.splice(j, 1);
			}else{
                game.RefreshLobby();
            }
		}
	}
}

function ProcessResetRequest(socket){
    for (let game of games) {
		if(game.players[0].socket.id == socket.id){
            game.RefreshLobby();
            game.answers = [];
            game.scores = [];
            game.timerRunning = false;
            game.questionTimeoutId;
            game.questionsAsked = 0;
            game.question = null;
            game.decoys = [];
            game.questionTime = null;
			return;
		}
	}
}

function GenerateTag(){
	letters = ["A","B","C","D","E","F","G","H","J","K","L","M","N","P","Q","R","S","T","U","V","W","Y","Z"]
	tag = ""
	for (let i = 0; i < 3; i++) {
		tag += letters[Math.floor(Math.random() * letters.length)];
	}
	for (let game of games) {
		if(game.tag == tag){
			return GenerateTag();
		}
	}
	return tag;
}

module.exports = { Game, CreateGame, ProcessPlayerDisconnection, JoinGame, ProcessStartGameRequest, ProcessAnswerRequest, ProcessNextQuestionRequest, ProcessResetRequest};