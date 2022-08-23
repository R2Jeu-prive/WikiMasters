import requests
import html
import json
import re
import time
import codecs

def GetPageNames():
    #build url for 30 random french wikipedia pages
    url = "https://fr.wikipedia.org/w/api.php?origin=*&action=query&format=json&prop=info&generator=random&grnnamespace=0&grnlimit=500";

    #fetch url
    response = requests.get(url, headers={"User-Agent":"botWikiMastersQuizGame/1.0 (R2Jeu.prive@gmail.com)"})
    response = json.loads(response.text)

    randomIds = response["query"]["pages"].keys()
    for randomId in randomIds:
        randomPage = response["query"]["pages"][randomId];
        if(len(randomPage["title"].split(" ")) >= 3):
            continue
        if(re.sub("^[A-ZÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð][A-Za-zàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšž-]+ [A-ZÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð][A-Za-zàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšž-]+$", "", randomPage["title"]) == ""):
            continue
        if(re.sub("^.*[0-9]+.*$", "", randomPage["title"]) == ""):
            continue
        if(len(re.findall("[0-9]{4}", randomPage["title"])) > 0):
            continue
        if(randomPage["title"].lower().find("histoire") != -1):
            continue
        if(randomPage["title"].lower().find("saint-") != -1):
            continue
        if(randomPage["length"] < 5000):
            continue
        pages.append([randomPage["title"]])
    print("LOADED " + str(len(pages)) + " titles")

def TryContentFilling():
    finishedRequest = False
    if(len(questions) >= 100):
        with codecs.open("gen_data/" + str(int(round(time.time() * 1000))) + ".json", "w", "utf-8-sig") as temp:
            temp.write(json.dumps(questions, ensure_ascii=False))
        pages.clear()
        questions.clear()
        finishedRequest = True
        return
    if(len(pages) == 0):
        GetPageNames()
        finishedRequest = True
        return
    page = pages[0]
    pages.pop(0)
    url = "https://fr.wikipedia.org/w/api.php?origin=*&action=query&format=json&prop=extracts&utf8=1&exsentences=1&exlimit=1&explaintext=1&exsectionformat=wiki&titles=" + page[0];
    response = requests.get(url, headers={"User-Agent":"botWikiMastersQuizGame/1.0 (R2Jeu.prive@gmail.com)"})
    response = json.loads(response.text)
    if(not("extract" in list(response["query"]["pages"][list(response["query"]["pages"].keys())[0]]))):
        with codecs.open("gen_data/error " + str(int(round(time.time() * 1000))) + ".json", "w", "utf-8-sig") as temp:
            temp.write(json.dumps(page, ensure_ascii=False) + "   \n   " + json.dumps(response, ensure_ascii=False))
        print(("ERROR ", page[0]))
        finishedRequest = True
        return
    page.append(response["query"]["pages"][list(response["query"]["pages"].keys())[0]]["extract"])
    if(len(page) == 1):
        print(("FAILED ", page[0]))
        finishedRequest = True
        return
    page[0] = re.sub("\(.*\)", "", page[0]).strip()
    page[1] = re.sub("\(.*\)", "", page[1]).strip()
    page[1] = re.sub("[ ]+", " ", page[1]).strip()
    
    if(page[1].find(page[0].lower()) == -1):
        print(("NOT COMMON", page[0]))
        finishedRequest = True
        return
    cancelStrings = []
    cancelStrings.append("\n")
    cancelStrings.append(" de formule ")
    cancelStrings.append("isotope ")
    cancelStrings.append("numéro atomique ")
    cancelStrings.append("isomère ")
    cancelStrings.append("est une espèce d")
    cancelStrings.append(" est une langue")
    cancelStrings.append(" est un composé inorganique")
    cancelStrings.append(" est un composé organique")
    cancelStrings.append(" est un alcaloïde ")
    cancelStrings.append(" est une molécule ")
    for cancelString in cancelStrings:
        if(page[1].find(cancelString) != -1):
            print(("CANCEL", page[0]))
            finishedRequest = True
            return
    if(page[1].find(" est ") == -1):
        print(("NO MUST", page[0]))
        finishedRequest = True
        return
    page[1] = " est " + page[1].split(" est ", 1)[1];
    wordsInTitle = page[0].lower().replace(",","").split(" ");
    wordsInDescription = page[1].lower().replace(",","").split(" ");
    for wordInTitle in wordsInTitle:
        for wordInDescription in wordsInDescription:
            if(wordInTitle == wordInDescription):
                print(("DUP", page[0]))
                finishedRequest = True
                return
    print("")
    print("")
    print(page)
    print("")
    print("")
    questions.append({"id" : list(response["query"]["pages"].keys())[0], "title" : page[0], "description" : page[1]})
    print(len(questions))
    finishedRequest = True
    return
    
pages = []
questions = []
finishedRequest = True;
while True:
    TryContentFilling()