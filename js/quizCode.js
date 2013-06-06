var questionIndex = 0;
var fourCities = [];
var geomorphOptions = [];
var onClick_connect;
var featureLayerCountries;
var featureLayerCantons;
var symbol;

function reset() {
    resetMap();

    // Disconnect events
    dojo.disconnect(onClick_connect);

    resetButtons();
}

function resetMap() {
    map.infoWindow.hide();
    map.graphics.clear();
    if (featureLayerCountries != null && featureLayerCountries.visible) {
        featureLayerCountries.hide();
    }
    if (featureLayerCantons != null && featureLayerCantons.visible) {
        featureLayerCantons.hide();
    }
}

function resetButtons() {
    $("#btnCheckAnswer").hide();
    $("#btnCheckAnswer").unbind('click');
    $("#btnNewQuestion").hide();
    $("#btnNewQuestion").unbind('click');
    $("#btnShowSolution").hide();
    $("#btnShowSolution").unbind('click');
}

function initPointOnMapQuestion() {
    reset();
    viewModel.chosenGame("Locate the City");

    $("#btnNewQuestion").show();
    $("#btnNewQuestion").click(function () {
        newPointOnMapQuestion();
    });

    // Connect onClick-event
    onClick_connect = dojo.connect(map, 'onClick', getCoordinates);

    // Load the questions-file
    $.ajax('data/cities_point.json', {
        async: false,
        dataType: "json",
        success: function (data) {
            questions = data;
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("Error while trying to retrive questions\n" + errorThrown);
        }
    });

    map.setExtent(getInitExtent());
    newPointOnMapQuestion();
}

function newPointOnMapQuestion() {
	resetMap();

	questionIndex = getNDifferentRndNumbers(1, questions.length);
	var question = questions[questionIndex];

	var container = $('#divQuestion');
	container.html('Where on the map is ' + question.cityname + ' located?');
}

function initGuessCityOnMapQuestion() {
    reset();
    viewModel.chosenGame("Guess the City");

    $("#btnCheckAnswer").click(function () {
        answer();
    });

    $("#btnNewQuestion").click(function () {
        newGuessCityOnMapQuestion();
    });

    // Load the questions-file
    $.ajax('data/capitals.json', {
        async: false,
        dataType: "json",
        success: function (data) {
            questions = data;
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("Error while trying to retrive questions\n" + errorThrown);
        }
    });

    newGuessCityOnMapQuestion();
}
			
function newGuessCityOnMapQuestion() {
	var container = $('#divQuestion');
	container.html('What city do you see on the map?<br/><br/>');
    
    // Choose four cities
	var rndNumbers = getNDifferentRndNumbers(4, questions.length);
	for (var i = 0; i < rndNumbers.length; i++) {
	    fourCities[i] = questions[rndNumbers[i]];
	}
	
	// Choose randomly a city from the above four cities
	questionIndex = getNDifferentRndNumbers(1, 4);
	var question = fourCities[questionIndex];

	for (var i = 0; i < 4; i++) {
	    $('<input type="radio" id="answer' + i + '" name="answer" value="'
		  + fourCities[i].cityname + '" /><label for="answer' + i + '">'
		  + fourCities[i].cityname + ', ' + fourCities[i].country + '</label><br/>').appendTo(container);
	}

	$("#btnCheckAnswer").show();
	$("#btnNewQuestion").hide();
	
	zoomTo(question.lon, question.lat, question.zoom);
}

function answer() {
    var checked = $('[name=answer]:checked');
    if (checked.length != 1) {
        alert('Select a valid answer.');
        return;
    }

	showAnswer(checked.val());
}

function showAnswer(option) {
    var cityname = fourCities[questionIndex].cityname;

    $("#btnCheckAnswer").hide();
    $("#btnNewQuestion").show();

    var point = esri.geometry.geographicToWebMercator(
		esri.geometry.Point(fourCities[questionIndex].lon, fourCities[questionIndex].lat));
    var hrefWikipedia = getWikiLink(cityname, "en");

    if (option == cityname) {
        map.infoWindow.setTitle("Correct!");
        map.infoWindow.setContent("It is indeed " + cityname + "<br/>" + hrefWikipedia);
    }
    else {
        map.infoWindow.setTitle("Wrong!");
        map.infoWindow.setContent("It is " + cityname + "<br/>" + hrefWikipedia);
    }

    map.infoWindow.show(point);
}

function initFeatureLayerCountries() {
    var url = "http://services.arcgis.com/hRUr1F8lE8Jq2uJo/arcgis/rest/services/Countries/FeatureServer/0";
    var template = new esri.InfoTemplate("Country", "Name: ${CNTRY_NAME}");
    featureLayerCountries = new esri.layers.FeatureLayer(url, {
        id: "world-regions",
        outFields: ["CNTRY_NAME"]
    });

    //TODO: Später mal testen mit featureLayerCountries.selectFeatures(query, esri.layers.FeatureLayer.SELECTION_NEW);
    //fl.setSelectionSymbol(new esri.symbol.SimpleFillSymbol().setOutline(null).setColor("#AEC7E3"));
}

function initFeatureLayerCantons() {
    var url = "https://services.arcgis.com/apU8fgSIuj1S2tCQ/arcgis/rest/services/cantonCopy_web_system/FeatureServer/0";
    var template = new esri.InfoTemplate("Canton", "Name: ${PROVNAME}");
    featureLayerCantons = new esri.layers.FeatureLayer(url, {
        id: "cantons",
        outFields: ["PROVNAME"]
    });
}

function initFindTheCountryQuestion() {
    reset();
    viewModel.chosenGame("Find the Country");

    $("#btnNewQuestion").show();
    $("#btnNewQuestion").click(function () {
        newFindTheCountryQuestion();
    });

    $("#btnShowSolution").show();
    $("#btnShowSolution").click(function () {
        showCountry(questions[questionIndex].country);
    });

    if (featureLayerCountries == null) {
        initFeatureLayerCountries();
        map.addLayer(featureLayerCountries);
    }
    else {
        featureLayerCountries.show();
    }

    // Init MarkerSymbol
    symbol = new esri.symbol.SimpleFillSymbol(
    	esri.symbol.SimpleFillSymbol.STYLE_SOLID,
    	new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
    		new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 0, 0, 0.5]));

    // Load the questions-file
    $.ajax('data/countries.json', {
        async: false,
        dataType: "json",
        success: function (data) {
            questions = data;
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("Error while trying to retrive questions\n" + errorThrown);
        }
    });

    // Connect onClick-event
    onClick_connect = dojo.connect(map, 'onClick', getCountryName);

    map.setExtent(getInitExtent());
    newFindTheCountryQuestion();
}

function newFindTheCountryQuestion() {
    //TODO: Momentan problematisch wegen featureLayer(hide)
    //resetMap();
    // Daher nur mal das:
    map.infoWindow.hide();
    map.graphics.clear();
    map.setExtent(getInitExtent());

    questionIndex = getNDifferentRndNumbers(1, questions.length);
    var question = questions[questionIndex];

    var container = $('#divQuestion');
    container.html('Where is ' + question.country + '?');
}

function showCountry(country) {
    queryTask = new esri.tasks.QueryTask(featureLayerCountries.url);

    // Build query filter
    query = new esri.tasks.Query();
    query.where = "CNTRY_NAME = '" + country + "'";
    query.returnGeometry = true;
    query.outFields = ["CNTRY_NAME"];

    // Execute querytask, mark country on map and zoom to the corresponding extent
    queryTask.execute(query, function (results) {
        var data = dojo.map(results.features, function (feature) {
            var graphic = feature;
            graphic.setSymbol(symbol);
            map.graphics.add(graphic);
            map.setExtent(feature.geometry.getExtent().expand(5.0));
        });
    });
}

function getCoordinates(evt) {
    //get mapPoint from event
    //The map is in web mercator - modify the map point to display the results in geographic
    var mp = esri.geometry.webMercatorToGeographic(evt.mapPoint);

    // esri.symbol.SimpleMarkerSymbol(style, size, outline, color)
    var markerSymbol = new esri.symbol.SimpleMarkerSymbol(
      esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE,
      10,
      new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 1),
      new dojo.Color([255, 0, 0, 0.5]));

    map.graphics.clear();
    map.graphics.add(new esri.Graphic(
      evt.mapPoint,
      markerSymbol
    ));

    var solutionPoint = esri.geometry.geographicToWebMercator(
      esri.geometry.Point(questions[questionIndex].lon, questions[questionIndex].lat));

    markerSymbol = new esri.symbol.SimpleMarkerSymbol(
      esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE,
      10,
      new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 0, 255]), 1),
      new dojo.Color([0, 0, 255, 0.5]));

    map.graphics.add(new esri.Graphic(
      solutionPoint,
      markerSymbol
    ));

    // Distance between solution and user point
    var dist = Math.round(computeDistance(
    	computeRad(questions[questionIndex].lat),
    	computeRad(questions[questionIndex].lon),
    	computeRad(mp.y),
    	computeRad(mp.x)));

    if (dist < 150) {
        map.infoWindow.setTitle("Excellent");
        map.infoWindow.setContent("A very good guess.<br/>" + getWikiLink(questions[questionIndex].cityname, "en"));
    }
    else {
        map.infoWindow.setTitle("Oops");
        map.infoWindow.setContent("Missed by " + dist + "km.");
    }

    map.infoWindow.show(solutionPoint);
}

function getCountryName(evt) {
    queryTask = new esri.tasks.QueryTask(featureLayerCountries.url);

    // Build query filter
    query = new esri.tasks.Query();
    query.returnGeometry = true;
    query.outFields = ["CNTRY_NAME"];

    //onClick event returns the evt point where the user clicked on the map.
    //This contains the mapPoint (esri.geometry.point) and the screenPoint (pixel xy where the user clicked).
    //set query geometry = to evt.mapPoint Geometry
    query.geometry = evt.mapPoint;

    //Execute task and call showResults on completion
    queryTask.execute(query, showResults);
}

function showResults(featureSet) {
    // Remove all graphics on the maps graphics layer
    map.graphics.clear();

    // QueryTask returns a featureSet.  Loop through features in the featureSet and add them to the map.
    dojo.forEach(featureSet.features, function (feature) {
        var graphic = feature;
        graphic.setSymbol(symbol);

        if (feature.attributes.CNTRY_NAME == questions[questionIndex].country) {
            map.infoWindow.setTitle("Correct");
            map.infoWindow.setContent("This is indeed " + feature.attributes.CNTRY_NAME + "<br/>" + getWikiLink(feature.attributes.CNTRY_NAME, "en"));
        }
        else {
            map.infoWindow.setTitle("Wrong");
            map.infoWindow.setContent("This is " + feature.attributes.CNTRY_NAME + " and not " + questions[questionIndex].country);
        }

        // Add graphic to the map graphics layer.
        map.graphics.add(graphic);
        map.infoWindow.show(query.geometry);
    });
}

function initGuessGeomorphOnMapQuestion() {
    reset();
    viewModel.chosenGame("Guess the Geomorphological Form");

    $("#btnCheckAnswer").click(function () {
        answerGeomorph();
    });

    $("#btnNewQuestion").click(function () {
        newGuessGeomorphOnMapQuestion();
    });

    // Load the questions-file
    $.ajax('data/geomorph.json', {
        async: false,
        dataType: "json",
        success: function (data) {
            questions = data;
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("Error while trying to retrive questions\n" + errorThrown);
        }
    });

    newGuessGeomorphOnMapQuestion();
}
			
function newGuessGeomorphOnMapQuestion() {
	var container = $('#divQuestion');
	container.html('What geomorphological form do you see on the map?<br/><br/>');
    
    // Choose three geomorphological structures
	var rndNumbers = getNDifferentRndNumbers(3, questions.length);
	for (var i = 0; i < rndNumbers.length; i++) {
	    geomorphOptions[i] = questions[rndNumbers[i]];
	}
	
	// Choose randomly a structure from the above three geomorphological structures
	questionIndex = getNDifferentRndNumbers(1, 3);
	var question = geomorphOptions[questionIndex];

	for (var i = 0; i < 3; i++) {
	    $('<input type="radio" id="answer' + i + '" name="answer" value="'
		  + geomorphOptions[i].name + '" /><label for="answer' + i + '">'
		  + geomorphOptions[i].name + '</label><br/>').appendTo(container);
	}

	$("#btnCheckAnswer").show();
	$("#btnNewQuestion").hide();
	
	zoomTo(question.lon, question.lat, question.zoom);
}

function answerGeomorph() {
    var checked = $('[name=answer]:checked');
    if (checked.length != 1) {
        alert('Select a valid answer.');
        return;
    }

	showAnswerGeomorph(checked.val());
}

function showAnswerGeomorph(option) {
    var geomorphName = geomorphOptions[questionIndex].name;

    $("#btnCheckAnswer").hide();
    $("#btnNewQuestion").show();

    var point = esri.geometry.geographicToWebMercator(
		esri.geometry.Point(geomorphOptions[questionIndex].lon, geomorphOptions[questionIndex].lat));
    var hrefWikipedia = getWikiLink(geomorphName, "de");

    if (option == geomorphName) {
        map.infoWindow.setTitle("Richtig!");
        map.infoWindow.setContent(hrefWikipedia);
    }
    else {
        map.infoWindow.setTitle("Falsch!");
        map.infoWindow.setContent("Das ist ein(e) " + geomorphName + "<br/>" + hrefWikipedia);
    }

    map.infoWindow.show(point);
}

/*
GAME: FIND THE CANTON
*/
function initFindTheCantonQuestion() {
    reset();
    viewModel.chosenGame("Find the Canton");

    $("#btnNewQuestion").show();
    $("#btnNewQuestion").click(function () {
        newFindTheCantonQuestion();
    });

    //$("#btnShowSolution").show();
    //$("#btnShowSolution").click(function () {
    //    showCountry(questions[questionIndex].country);
    //});

    if (featureLayerCountries == null) {
        initFeatureLayerCantons();
        map.addLayer(featureLayerCantons);
    }
    else {
        featureLayerCantons.show();
    }

    // Init MarkerSymbol
    symbol = new esri.symbol.SimpleFillSymbol(
    	esri.symbol.SimpleFillSymbol.STYLE_SOLID,
    	new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
    		new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 0, 0, 0.5]));

    // Load the questions-file
    $.ajax('data/cantons.json', {
        async: false,
        dataType: "json",
        success: function (data) {
            questions = data;
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("Error while trying to retrive questions\n" + errorThrown);
        }
    });

    // Connect onClick-event
    onClick_connect = dojo.connect(map, 'onClick', getCantonName);

    map.setExtent(getInitExtentSwitzerland());
    newFindTheCantonQuestion();
}

function newFindTheCantonQuestion() {
    //TODO: Momentan problematisch wegen featureLayer(hide)
    //resetMap();
    // Daher nur mal das:
    map.infoWindow.hide();
    map.graphics.clear();

    questionIndex = getNDifferentRndNumbers(1, questions.length);
    var question = questions[questionIndex];

    var container = $('#divQuestion');
    var img = "<img src=\"" + question.image + "\" width=\"120\">";
    container.html(img);
}

function getCantonName(evt) {
    queryTask = new esri.tasks.QueryTask(featureLayerCantons.url);

    // Build query filter
    query = new esri.tasks.Query();
    query.returnGeometry = true;
    query.outFields = ["PROVNAME"];

    //onClick event returns the evt point where the user clicked on the map.
    //This contains the mapPoint (esri.geometry.point) and the screenPoint (pixel xy where the user clicked).
    //set query geometry = to evt.mapPoint Geometry
    query.geometry = evt.mapPoint;

    //Execute task and call showResults on completion
    queryTask.execute(query, showResultCanton);
}

function showResultCanton(featureSet) {
    // Remove all graphics on the maps graphics layer
    map.graphics.clear();

    // QueryTask returns a featureSet.  Loop through features in the featureSet and add them to the map.
    dojo.forEach(featureSet.features, function (feature) {
        var graphic = feature;
        graphic.setSymbol(symbol);

        if (feature.attributes.PROVNAME == questions[questionIndex].name) {
            map.infoWindow.setTitle("Richtig!");
            map.infoWindow.setContent("Das ist in der Tat " + feature.attributes.PROVNAME + "<br/>" + getWikiLink(feature.attributes.PROVNAME, "de"));
        }
        else {
            map.infoWindow.setTitle("Falsch!");
            map.infoWindow.setContent("Das ist " + feature.attributes.PROVNAME + " und nicht " + questions[questionIndex].name);
        }

        // Add graphic to the map graphics layer.
        map.graphics.add(graphic);
        map.infoWindow.show(query.geometry);
    });
}

/* 
GAME: LOCATE THE PEAK
*/
function initLocateThePeakQuestion() {
    reset();
    viewModel.chosenGame("Locate the Peak");

    $("#btnNewQuestion").show();
    $("#btnNewQuestion").click(function () {
        newLocateThePeakQuestion();
    });

    // Connect onClick-event
    onClick_connect = dojo.connect(map, 'onClick', getCoordinates);

    // Load the questions-file
    $.ajax('data/peaks.json', {
        async: false,
        dataType: "json",
        success: function (data) {
            questions = data;
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("Error while trying to retrive questions\n" + errorThrown);
        }
    });

    map.setExtent(getInitExtentSwitzerland());
    newLocateThePeakQuestion();
}

function newLocateThePeakQuestion() {
	resetMap();

	questionIndex = getNDifferentRndNumbers(1, questions.length);
	var question = questions[questionIndex];

	var container = $('#divQuestion');
	container.html('Where on the map is ' + question.name + ' located?');
}