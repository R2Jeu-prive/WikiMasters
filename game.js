games = [];
const Q = require("./question.js");

class Game{
	constructor(hostUser){
		this.players = [hostUser];
		this.tag = GenerateTag();
		this.answers = [];
		this.scores = [];
		this.timerRunning = false;
		this.questionsAsked = 0;
		this.question = null;
		this.questionTime = null;
	}
	RefreshClients(){
		let playerList = []
		for (let player of this.players) {
			playerList.push(player.pseudo);
		}
		for (let player of this.players) {
			player.socket.emit("refreshLobby", {playerList : playerList, isHost : player.pseudo == this.players[0].pseudo, tag : tag});
		}
	}
	Start(){
		this.questionsAsked = 0;
		for (let player of this.players) {
			this.scores.push([]);
		}
		this.AskQuestion();
	}

	AskQuestion(){
		this.timerRunning = true;
		this.questionTime = Date.now();
		this.questionsAsked += 1;
		let a = Q.Fetch();
		this.question = a;
		let answerPool = [a.title,Q.FetchTitle(),Q.FetchTitle(),Q.FetchTitle(),Q.FetchTitle(),Q.FetchTitle()]

		for (let i = 0; i < 6; i++) {
			let k = Math.floor(Math.random() * 6);
			let j = Math.floor(Math.random() * 6);
			let temp = answerPool[k];
			answerPool[k] = answerPool[j];
			answerPool[j] = temp;
		}
		this.answers = [];
		for (let [i, player] of this.players.entries()) {
			this.answers.push("");
			this.scores[i].push(10000);
			player.socket.emit("question", {description : this.question.description, titles : answerPool})
		}

		setTimeout(this.CorrectAnswers.bind(this), 10000);
	}

	CorrectAnswers(){
		this.timerRunning = false;
		let clientScores = []
		for (let [i,player] of this.players.entries()) {
			if(this.answers[i] != this.question.title){
				this.scores[i][this.questionsAsked-1] = 10000;
			}
			clientScores.push([player.pseudo])
			for (let score of this.scores[i]) {
				clientScores[i].push(score);
			}
		}
		for (let [i,player] of this.players.entries()) {
			player.socket.emit("correction", {answer : this.answers[i], time : this.scores[i][this.questionsAsked-1], correction : this.question.title + " " + this.question.description, pageid : this.question.id, scores : clientScores, isHost : player.pseudo == this.players[0].pseudo})
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
	games[games.length-1].RefreshClients();
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
		game.RefreshClients();
		return true
	}
	return false;//couldn't find game with this tag
}

function StartGame(socket){
	for (let game of games) {
		if(game.players[0].socket.id == socket.id){
			game.Start();
			break;
		}
	}
}

function NextQuestion(socket){
	for (let game of games) {
		if(game.players[0].socket.id == socket.id){
			game.AskQuestion();
			break;
		}
	}
}

function SaveAnswer(socket, answer){
	for (let [i, game] of games.entries()){
		if(!game.timerRunning){
			continue;
		}
		for (let [j,gamePlayer] of game.players.entries()) {
			if(gamePlayer.socket.id == socket.id){
				game.answers[j] = answer
				game.scores[j][game.questionsAsked-1] = Date.now()-game.questionTime;
				console.log(game.answers)
				console.log(game.scores)
				return;
			}
		}
	}
}

function PlayerLeft(player){
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
			}
			game.RefreshClients();
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

module.exports = { Game, CreateGame, PlayerLeft, JoinGame, StartGame, SaveAnswer, NextQuestion};