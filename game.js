let games = [];
const Q = require("./question.js");

class Game{
	constructor(hostUser){
		this.players = [hostUser];
		this.tag = GenerateTag();
        this.status = "lobby"; //lobby | countdown | question | correction | pathfind | pathresult | end
		this.answers = [];
		this.scores = [];
		this.canAnswerQuestion = false;
        this.canProgressPath = false;
        this.timeoutId = -1;
		this.questionsAsked = 0;
        this.questionsTotal = 10;
        this.pathfindQuestionIds = [];//between 1 and questionsTotal
		this.question = null;
        this.decoys = [];
        this.pathfind = []; //start and end of pathfind
        this.paths = []; //page ids taken by players 
        this.pathTime = 180000; //time given after first answer
		this.questionTime = null;
        this.lobbyIsOpen = true;
        this.mode = "short";
	}

    SetOptions(options){
        if(this.status != "lobby"){return;}
        this.lobbyIsOpen = options.open;
        this.mode = options.mode;
        console.log(options);
        this.RefreshLobby();
    }

    //sends all players lobby info needed
	RefreshLobby(){
        this.status = "lobby";
		let playerList = []
		for (let player of this.players) {
			playerList.push(player.pseudo);
		}
		for (let player of this.players) {
			player.socket.emit("refreshLobby", {playerList : playerList, isHost : player.pseudo == this.players[0].pseudo, tag : this.tag, mode : this.mode, lobbyIsOpen : this.lobbyIsOpen});
		}
	}

    //inits gamescores and asks first question
	Start(){
		this.questionsAsked = 0;
        this.answers = [];
		this.scores = [];

        if(this.mode == "short"){
            this.questionsTotal = 11;
            this.pathfindQuestionIds = [11];
        }else if(this.mode == "long"){
            this.questionsTotal = 23;
            this.pathfindQuestionIds = [11,22,23];
        }else if(this.mode == "title"){
            this.questionsTotal = 5;
            this.pathfindQuestionIds = [];
        }else if(this.mode == "pathfind"){
            this.questionsTotal = 1;
            this.pathfindQuestionIds = [1];
        }

        if(this.players.length == 1){
            this.pathTime = 0; //nobody to wait !
        }else{
            //this.pathTime = 180000; //3 min
            this.pathTime = 5000; //5 sec
        }
		for (let player of this.players) {
			this.scores.push([]);
		}
		this.Countdown();
	}

    Countdown(){
        let isPathFind = this.pathfindQuestionIds.includes(this.questionsAsked + 1)
        this.status = "countdown";
        this.ShowCount(3);
        setTimeout(this.ShowCount.bind(this,2), 500);
        setTimeout(this.ShowCount.bind(this,1), 1000);
        if(isPathFind){
            setTimeout(this.SendPathfind.bind(this), 1500);
        }else{
            setTimeout(this.AskQuestion.bind(this), 1500);
        }
    }

    ShowCount(num){
        for (let [i, player] of this.players.entries()) {
            player.socket.emit("countdown", num);
        }
    }

    SendPathfind(){
        this.canProgressPath = true;
        this.timeoutId = -1;
        this.questionsAsked += 1;
        //this.pathfind = [{id:9175315, title:'Courant magellanique'}, {id:64, title:'Astronomie'}];
        this.pathfind = [Q.Fetch(), Q.Fetch()];
        this.paths = [];
        for (let [i, player] of this.players.entries()) {
			this.paths.push([[parseInt(this.pathfind[0].id), this.pathfind[0].title]]);
            this.scores[i].push(20000);
			player.socket.emit("pathfind", {
                start : this.pathfind[0],
                end : this.pathfind[1]
            });
		}
        this.status = "pathfind";
        this.SendPathTime(false);
    }

	AskQuestion(){
		this.canAnswerQuestion = true;
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
			this.scores[i].push(-1);
			player.socket.emit("question", {
                description : this.question.description,
                titles : answerPool
            });
		}
        this.status = "question";
		this.timeoutId = setTimeout(this.RefreshCorrection.bind(this), 10000);
	}

	RefreshCorrection(){
        this.status = "correction";
		this.canAnswerQuestion = false;
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
			player.socket.emit("correction", {
                answer : this.answers[i],
                time : this.scores[i][this.questionsAsked-1],
                correction : this.question.title + " " + this.question.description,
                pages : [this.question].concat(this.decoys),
                scores : clientScores,
                isHost : player.pseudo == this.players[0].pseudo,
                questionProgression : [this.questionsAsked, this.questionsTotal]
            });
		}
	}

    SendPathTime(_running){
        for (let [i,player] of this.players.entries()) {
			player.socket.emit("pathTime", {
                time : this.pathTime,
                running : _running
            });
		}
    }

    RefreshPathResult(){
        this.status = "pathresult";
		this.canProgressPath = false;
		let clientScores = [] //[["playerA", 10000, 5678, 3200], ["playerB", 10000, 9994, 1002]]
		for (let [i,player] of this.players.entries()) {
			clientScores.push([player.pseudo])
			for (let score of this.scores[i]) {
				clientScores[i].push(score);
			}
		}
		for (let [i,player] of this.players.entries()) {
			player.socket.emit("pathresult", {
                time : this.scores[i][this.questionsAsked-1],
                scores : clientScores,
                isHost : player.pseudo == this.players[0].pseudo,
                questionProgression : [this.questionsAsked, this.questionsTotal]
            });
		}
	}

    RefreshEndScreen(){
        this.status = "end";
        let clientScores = [] //[["playerA", 10000, 5678, 3200], ["playerB", 10000, 9994, 1002]]
		for (let [i,player] of this.players.entries()) {
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
        if(game.status != "lobby" || game.lobbyIsOpen == false){
            return false;//game is closed or running;
        }
		game.players.push(user);
		console.log(user.pseudo + " JOINED " + game.tag);
		game.RefreshLobby();
		return true;
	}
	return false;//couldn't find game with this tag
}

function ProcessChangeGameOptionsRequest(socket, options){
    for (let game of games) {
		if(game.players[0].socket.id == socket.id){
            console.log("valid");
			game.SetOptions(options);
			break;
		}
	}
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
                game.RefreshEndScreen();
            }
			return;
		}
	}
}

function ProcessAnswerRequest(socket, answer){
	for (let [i, game] of games.entries()){
		if(!game.canAnswerQuestion){
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
                clearTimeout(game.timeoutId);
                game.RefreshCorrection();
			}
		}
	}
}

function ProcessPathResetRequest(socket){
    for (let [i, game] of games.entries()){
		if(game.pathfind.length == 0){
			continue;
		}
        for (let [j,gamePlayer] of game.players.entries()) {
			if(gamePlayer.socket.id == socket.id){
                game.paths[j] = [[parseInt(game.pathfind[0].id), game.pathfind[0].title]];
            }
        }
    }
}

function ProcessPathStepRequest(socket, page){
    for (let [i, game] of games.entries()){
		if(game.pathfind.length == 0){
			continue;
		}
        for (let [j,gamePlayer] of game.players.entries()) {
			if(gamePlayer.socket.id == socket.id){
                game.paths[j].push([page.id, page.title]);
                if(page.id == parseInt(game.pathfind[1].id)){
                    if(game.timeoutId == -1){
                        game.timeoutId = setTimeout(game.RefreshPathResult.bind(game), game.pathTime);
                        game.SendPathTime(true);
                        game.scores[j][game.questionsAsked-1] = -20000;
                    }else{
                        game.scores[j][game.questionsAsked-1] = -10000;
                    }
                    socket.emit("waitPath", game.scores[j][game.questionsAsked-1]);
                }
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
			if(game.status == "lobby"){
                game.RefreshLobby();
            }else if(game.status == "question"){
				game.answers.splice(j, 1);
				game.scores.splice(j, 1);
			}else if(game.status == "pathfind"){
                game.paths.splice(j, 1);
				game.scores.splice(j, 1);
            }else if(game.status == "end"){
                game.RefreshEndScreen()
            }else if(game.status == "pathresult"){
                game.RefreshPathResult()
            }else if(game.status == "correction"){
                game.RefreshCorrection()
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
            game.canAnswerQuestion = false;
            game.timeoutId = -1;
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

module.exports = { Game, CreateGame, ProcessPlayerDisconnection, JoinGame, ProcessStartGameRequest, ProcessAnswerRequest, ProcessNextQuestionRequest, ProcessResetRequest, ProcessPathResetRequest, ProcessPathStepRequest, ProcessChangeGameOptionsRequest};