const fetch = require('node-fetch');
let pages;
let questions;

function Init(){
	pages = [];
	questions = [];
}

function Fetch(){
	if(questions.length == 0){
		return new Question(-1, "WikiMasters", "est cassé");
	}
	return questions.shift();
}

class Question{
	constructor(id, title, description){
		this.id = id;
		this.title = title;
		this.description = description;
	}
}

module.exports = {Init, Fetch};