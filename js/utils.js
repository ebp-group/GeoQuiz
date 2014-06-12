/* n = Number of random numbers to be created
   m = Upper boundary of the random numbers */
function getNDifferentRndNumbers(n, m) {
    var arr = [];
    var randomnumber = -1;
    var found = false;
    
    while (arr.length < n) {
        randomnumber = Math.floor(Math.random() * m);
        found = false;
        // Avoid to get equal random numbers
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === randomnumber) { found = true; break; }
        }
        if (!found) { arr[arr.length] = randomnumber; }
    }
	
	return arr;
}

// Create URL to wikipedia page; lang defines the desired language (version) of wikipedia
function getWikiLink(wikiTopic, lang) {
    var urlWikipedia = encodeURI("http://" + lang + ".wikipedia.org/wiki/" + wikiTopic);
    var hrefWikipedia = "<a target='_blank' href=" + urlWikipedia + ">Read more in Wikipedia</a>";

    return hrefWikipedia;
}

function showPointsAnimation() {
    var paper = Raphael(0, 400, 450, 450);
    paper.text(150, 150, "+100").attr({ font: "50px Helvetica", fill: "#fff" }).animate({ transform: "s2.5" }, 1000, "backOut", function(){paper.clear();});
}