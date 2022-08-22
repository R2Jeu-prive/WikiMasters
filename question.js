const fetch = require('node-fetch');
const fs = require("fs");
let pages;
let questions;

function Init(){
	pages = [];
	questions = [];
	let rawdata = fs.readFileSync('data/7.json');
	let text = rawdata.toString()
	console.log(text)
	console.log(JSON.parse(text.slice(1)))
	/*let file = JSON.parse(rawdata);
	console.log(file);*/
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