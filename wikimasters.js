const express = require('express');
const app = express();
const router = express.Router();
const path = require('path')
const mime = require('mime');
const Q = require("./question.js");
const U = require("./user.js");
const G = require("./game.js");
const { Server } = require("socket.io");

let routes = []
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
routes.push(["/js/error","/client/js/error.js"])
routes.push(["/css/error","/client/css/error.css"])
routes.push(["/js/loading","/client/js/loading.js"])
routes.push(["/css/loading","/client/css/loading.css"])
routes.push(["/js/countdown","/client/js/countdown.js"])
routes.push(["/css/countdown","/client/css/countdown.css"])
routes.push(["/js/waiting","/client/js/waiting.js"])
routes.push(["/css/waiting","/client/css/waiting.css"])
routes.push(["/js/end","/client/js/end.js"])
routes.push(["/css/end","/client/css/end.css"])
routes.push(["/js/browse","/client/js/browse.js"])
routes.push(["/css/browse","/client/css/browse.css"])
routes.push(["/js/pathresult","/client/js/pathresult.js"])
routes.push(["/css/pathresult","/client/css/pathresult.css"])
routes.push(["/css/wikipedia","/client/css/wikipedia.css"])
routes.push(["/css/phone","/client/css/phone.css"])
for (let route of routes) {
	router.get(route[0], function(req, res){
		res.set('Content-Type', mime.getType(route[1].split(".")[1]));
		res.sendFile(path.join(__dirname, route[1]));
	})
	app.use(route[0], router)
}

let server = app.listen(8001, function(){
  console.log("WIKIMASTERS running on port 8001");
});

const io = new Server(server);

io.on('connection', (socket) => {
	U.AddUser(socket);
	socket.emit("setPseudo", {pseudo : socket.id});
	console.log('CONNECTED ' + socket.id);

	socket.on("changePseudo", (data, callback) => {
        if(!("pseudo" in data)){callback(false);return;}
        if(typeof data.pseudo !== 'string'){callback(false);return;}
        if(U.GetUser(socket).pseudo != socket.id){callback(false);return;}
		changed = U.RenameUser(socket, data.pseudo);
		if(changed){
			socket.emit("setPseudo", {pseudo : U.GetUser(socket).pseudo});
		}
		callback(changed);
	})
	socket.on("createGame", (callback) => {
		if(U.GetUser(socket).pseudo == socket.id){
			callback(false);
			return;
		}
		callback(G.CreateGame(U.GetUser(socket)))
	})
	socket.on("joinGame", (tag, callback) => {
        if(typeof tag !== 'string'){callback(false);return;}
		if(U.GetUser(socket).pseudo == socket.id){
			callback(false);
			return;
		}
		callback(G.JoinGame(U.GetUser(socket), tag))
	})
    socket.on("changeGameOptions", (options) => {
        if(!("mode" in options)){return;}
        if(typeof options.mode !== 'string'){return;}
        if(!("open" in options)){return;}
        if(typeof options.open !== 'boolean'){return;}
		G.ProcessChangeGameOptionsRequest(socket, options);
	})
	socket.on("startGame", () => {
		G.ProcessStartGameRequest(socket);
	})
	socket.on("nextQuestion", () => {
		G.ProcessNextQuestionRequest(socket);
	})
	socket.on("answer", (answer) => {
        if(typeof answer !== 'string'){return;}
		G.ProcessAnswerRequest(socket, answer);
	})
    socket.on("pathreset", () => {
		G.ProcessPathResetRequest(socket);
	})
    socket.on("newpath", () => {
		G.ProcessNewPathRequest(socket);
	})
    socket.on("pathstep", (page) => {
        if(!("id" in page)){return;}
        if(typeof page.id !== 'number'){return;}
        if(!("title" in page)){return;}
        if(typeof page.title !== 'string'){return;}
		G.ProcessPathStepRequest(socket, page);
	})
    socket.on("reset", () => {
		G.ProcessResetRequest(socket);
	})
	socket.on('disconnect', (reason) => {
		let user = U.GetUser(socket);
		G.ProcessPlayerDisconnection(user);
		console.log('DISCONNECTED ' + user.pseudo + " (" + reason + ")");
		U.RemoveUser(socket);
	});
});

Q.Init();
