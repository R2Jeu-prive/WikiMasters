const fetch = require('node-fetch');
let pages;
let questions;

function Init(){
	pages = [];
	questions = [];
	FillQuestionBuffer();
	setInterval(FillQuestionBuffer,2000);
}

function FillPageBuffer(){
	//build url for 30 random french wikipedia pages
	var url = "https://fr.wikipedia.org/w/api.php";
	var params = {
		"action": "query",
		"format": "json",
		"prop": "info",
		"generator": "random",
		"grnnamespace": "0",
		"grnlimit": "500"
	};
	url = url + "?origin=*";
	Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];});

	//fetch url
	fetch(url, {headers:{"User-Agent":"botWikiMastersQuizGame/1.0 (R2Jeu.prive@gmail.com)"}})
	.then(function(response){return response.json();})
	.then(function(response) {
		var randomPages = response.query.pages;
		for (var i in randomPages) {
			let randomPage = randomPages[i];
			//remove pages with title of 4 words or more
			if(randomPage.title.split(" ").length > 3){
				continue;
			}
            //filter out too small pages, and very long pages
			if(randomPage.length < 20000 || randomPage.length > 90000){
				continue;
			}
			pages.push(randomPage);
		}
		console.log("BUFFERS : " + pages.length + "p " + questions.length + "q");
	})
	.catch(function(error){console.log(error);});
}

function FillQuestionBuffer(){
	if(questions.length >= 20){
		return;
	}
	if(pages.length < 30){
		FillPageBuffer();
		return;
	}
	//build url for one page content request
	var pageId = pages[0].pageid;
	var url = "https://fr.wikipedia.org/w/api.php";
	var params = {action: "parse", format: "json", pageid: pageId.toString(), prop: "text", formatversion :"2", callback : ""};
	url = url + "?origin=*";
	Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];});

    //remove page from pages
    pages.shift();

	//send request
	fetch(url, {headers:{"User-Agent":"botWikiMastersQuizGame/1.0 (R2Jeu.prive@gmail.com)"}})
	.then(function(response){
		response.text().then(function(str){
            //initial formating
			str = str.substring(5, str.length - 1);
			json = JSON.parse(str);
			title = json.parse.title;
			text = json.parse.text;
			text = text.replace('\"','"');
			description = GetDescriptionFromContent(text);
            if(!description){return;}
            if(DescriptionHasTitleElements(title, description)){return;}
            console.log("NEW QUESTION {" + pageId + "}: " + title + " " + description);
            questions.push(new Question(pageId,title,description));
            console.log("BUFFERS : " + pages.length + "p " + questions.length + "q");
		})
	})
	.catch(function(error){console.log(error);});
}

function DescriptionHasTitleElements(title, description){
	for (let i = 0; i < title.length-4; i++) {
		let subTitle = title.substring(i, i+4);
		if(description.includes(subTitle)){
			return true;
		}
	}
	return false;
}

function GetDescriptionFromContent(r){
    //remove most people and city pages
    let s = r.toLowerCase();
    if(s.indexOf("biographie") != -1 && s.indexOf("né") != -1 && s.indexOf("nationalité") != -1){
        return false;
    }
    if(s.indexOf("commune") != -1 && s.indexOf("code postal") != -1 && s.indexOf("superficie") != -1 && s.indexOf("capitale") == -1){
        return false;
    }

	//get paragraphs
	startIndexes = [];
	endIndexes = [];
	paragraphs = [];
    let startStrings = [" est ", " était ", " sont ", " étaient ", " fait référence "];
	i = r.indexOf("<p");
	while(true){
		if(i==-1){break;}
		startIndexes.push(i);
		i = r.indexOf("<p", startIndexes.at(-1)+1);
	}
	i = r.indexOf("</p>");
	while(true){
		if(i==-1){break;}
		endIndexes.push(i+4);
		i = r.indexOf("</p>", endIndexes.at(-1)+1);
	}
	
	for (let i = 0; i < startIndexes.length; i++) {
		paragraphs.push(r.substring(startIndexes[i],endIndexes[i]));

        //remove paragraphs that don't have main verb
        let hasStartString = false;
        for(let startString of startStrings){
            if(paragraphs.at(-1).indexOf(startString) != -1){
                hasStartString = true;
                break;
            }
        }
        if(!hasStartString){
            paragraphs.pop()
            continue;
        }

		//remove paragraphs that don't start with <p> closed tag
		if(paragraphs.at(-1).indexOf("<p>") == -1){
			paragraphs.pop();
			continue;
		}
		//remove paragraphs that ref to a help page other than Japonese help page
		if(paragraphs.at(-1).indexOf("/wiki/Aide:") != -1 && paragraphs.at(-1).indexOf("/wiki/Aide:Japonais") == -1 && paragraphs.at(-1).indexOf("/wiki/Aide:Alphabet_phon") == -1){
			paragraphs.pop();
			continue;
		}
		//remove paragraphs that contain special strings that are false positive to description paragraph
		if(paragraphs.at(-1).indexOf("/wiki/Discussion:") != -1 || paragraphs.at(-1).indexOf('class="bandeau-titre"') != -1 || paragraphs.at(-1).indexOf("Les points d'amélioration suivants sont les cas les plus fréquents") != -1 || paragraphs.at(-1).indexOf("sont citées, de les associer à des analyses faites par des sources secondaires.") != -1){
		  paragraphs.pop();
		  continue;
		}
	}
	//return this article as non valid if no paragraph fit the needs
	if(paragraphs.length == 0){
		return false;
	}
	
	//remove html tags to keep plain text in description paragraph
	p = paragraphs[0];
	while(true){
		for (let simpleTag of ["<p>","</p>","<i>","</i>","<b>","</b>","</span>", "</a>","</sup>","</time>","</abbr>","</sub>"]) {
			i = p.indexOf(simpleTag);
			if(i != -1){
				p = p.substring(0,i) + p.substring(i+simpleTag.length);
				break;
			}
		}
		if(i!=-1){continue;}
		  
		end = p.indexOf(">");
		if(end != -1){
			start = end;
			for (let startTag of ["<span", "<a","<sup","<time","<abbr","<sub"]) {
				i = p.indexOf(startTag);
				if(i == -1){continue;}
				if(i < start){start = i;}
			} 
			p = p.substring(0,start) + p.substring(end+1);
			continue;
		}
		break;
	}
	
	//crop from verb to ponctuation
	start = p.length-1;
	for (let startString of startStrings) {
		i = p.indexOf(startString);
		if(i == -1){continue;}
		if(i < start){start = i;}
	}
	end = p.length-1;
	for (let endPonctuation of ["."]) {
		i = p.indexOf(endPonctuation, start);
		if(i == -1){continue;}
		if(i < end){end = i;}
	}
	p = p.substring(start+1,end);

	//crop description if too long
	if(p.length > 75){
		p.substring(0,75)
	};

	//parse special chars
	p = p.replaceAll("&#160;"," ");
	/*p = html.unescape(p[start+1:end])
	p = p.replace("\xa0"," ")*/
	return p;
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

module.exports = {Init, Fetch, FetchTitle};