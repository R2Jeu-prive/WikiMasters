const fetch = require('node-fetch');
const fs = require("fs");
let questions;

function Init(){
	questions = {};
	const fileCount = 7;
	for (let i = 1; i <= fileCount; i++) {
		let data = JSON.parse(fs.readFileSync("data/" + i + ".json").toString().slice(1));
		for (let j = 0; j < data.length; j++) {
			if(data[j].description.slice(-1) != "."){
				continue;
			}
			questions[data[j].id] = new Question(data[j].id, data[j].title, data[j].description);
		}
		console.log("imported " + data.length + " questions from file " + i + ".json");
	}
	console.log("finished import: " + Object.keys(questions).length + " questions")
}

function Fetch(){
	let keys = Object.keys(questions);
	if(keys.length == 0){
		Init();
		return Fetch();
	}
	let key = keys[Math.floor(Math.random()*keys.length)];
	let question = questions[key];
	delete questions[key];
	console.log(question);
	return question;
}

class Question{
	constructor(id, title, description){
		this.id = id;
		this.title = title;
		this.description = description;
	}
}

module.exports = {Init, Fetch};