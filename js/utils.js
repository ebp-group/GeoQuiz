/* n=Anzahl Zufallszahlen, die geliefert werden sollen
   m=Obergrenze der Zufallszahlen */
function getNDifferentRndNumbers(n, m) {
	var arr = [];
	while (arr.length < n){
	  var randomnumber=Math.floor(Math.random()*m)
	  var found=false;
	  for(var i=0;i<arr.length;i++){
		if(arr[i]==randomnumber){found=true;break}
	  }
	  if(!found)arr[arr.length]=randomnumber;
	}
	
	return arr;
}

// Create URL to english wikipedia page
function getWikiLink(wikiTopic){
	var urlWikipedia = encodeURI("http://en.wikipedia.org/wiki/" + wikiTopic);
	var hrefWikipedia = "<a target='_blank' href=" + urlWikipedia + ">Read more in Wikipedia</a>";

	return hrefWikipedia;
}