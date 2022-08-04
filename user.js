let users = []
function AddUser(socket){
	users.push(new User(socket));
}

function RemoveUser(disconnectedSocket){
	for(let [i,user] of users.entries()){
		if(user.socket.id == disconnectedSocket.id){
			users.splice(i, 1);
			return;
		}
	}
}

function RenameUser(socket, newPseudo){
	if(newPseudo == ""){
		return false;
	}
	k = -1;
	for(let [i,user] of users.entries()){
		if(user.socket.id == socket.id){
			k = i;
            continue;
		}
        if(user.pseudo == newPseudo){
			return false;
		}
	}
	users[k].pseudo = newPseudo
	console.log("RENAMED " + users[k].socket.id + " AS " + newPseudo);
	return true;
}

function GetUser(socket){
	for (let user of users){
		if(user.socket.id == socket.id){
			return user;
		}
	}
}

class User{
	constructor(socket){
		this.socket = socket;
		this.pseudo = socket.id;
	}
}

module.exports = { User, AddUser, RemoveUser, RenameUser, GetUser};