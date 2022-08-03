const express = require('express');
const app = express();
const router = express.Router();
const path = require('path')
const mime = require('mime');
const Q = require("./question.js");
const U = require("./user.js");
const G = require("./game.js");
const { Server } = require("socket.io");

routes = []
routes.push(["/","/client/index.html"])
routes.push(["/js","/client/js/index.js"])
routes.push(["/css","/client/css/index.css"])
routes.push(["/js/main","/client/js/main.js"])
routes.push(["/css/main","/client/css/main.css"])
routes.push(["/js/lobby","/client/js/lobby.js"])
routes.push(["/css/lobby","/client/css/lobby.css"])
routes.push(["/js/question","/client/js/question.js"])
routes.push(["/css/question","/client/css/question.css"])
routes.push(["/js/correction","/client/js/correction.js"])
routes.push(["/css/correction","/client/css/correction.css"])
routes.push(["/img/background","/client/img/background.jpeg"])
for (let route of routes) {
	router.get(route[0], function(req, res){
		res.set('Content-Type', mime.getType(route[1].split(".")[1]));
		res.sendFile(path.join(__dirname, route[1]));
	})
	app.use(route[0], router)
}

let server = app.listen(3000, function(){
  console.log("Web server is running on port 3000");
  console.log("to end press Ctrl + C");
});
const io = new Server(server);

io.on('connection', (socket) => {
	U.AddUser(socket);
	socket.emit("setPseudo", {pseudo : socket.id})
	console.log('CONNECTED ' + socket.id);
	socket.on("requestPseudoChange", (data, callback) => {
		changed = U.RenameUser(socket, data.pseudo);
		if(changed){
			socket.emit("setPseudo", {pseudo : U.GetUser(socket).pseudo})
		}
		callback(changed);
	})
	socket.on("requestCreateGame", (callback) => {
		if(U.GetUser(socket).pseudo == socket.id){
			callback(false);
			return;
		}
		callback(G.CreateGame(U.GetUser(socket)))
	})
	socket.on("requestJoinGame", (tag, callback) => {
		if(U.GetUser(socket).pseudo == socket.id){
			callback(false);
			return;
		}
		callback(G.JoinGame(U.GetUser(socket), tag))
	})
	socket.on("startGame", () => {
		G.StartGame(socket);
	})
	socket.on("nextQuestion", () => {
		G.NextQuestion(socket);
	})
	socket.on("answer", (answer) => {
		console.log(answer);
		G.SaveAnswer(socket, answer);
	})
	socket.on('disconnect', (reason) => {
		let user = U.GetUser(socket);
		G.PlayerLeft(user);
		console.log('DISCONNECTED ' + user.pseudo + " (" + reason + ")");
		U.RemoveUser(socket);
	});
});

Q.Init();
