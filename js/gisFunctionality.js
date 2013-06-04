function zoomTo(lon, lat, zoom) {
	var point = esri.geometry.geographicToWebMercator(esri.geometry.Point(lon, lat));
	map.centerAndZoom(point, zoom);
}

function initLayer(url, id) {
	var layer = new esri.layers.ArcGISTiledMapServiceLayer(url, {
		id: id,
		visible: false
  });
  map.addLayer(layer);

  return layer;
}

function changeMap(layers) {
  hideImageTiledLayers(layers);
  for (var i = 0; i < layers.length; i++) {
    layers[i].show();
  }
}

function hideImageTiledLayers(layers) {
  for (var j = 0, jl = map.layerIds.length; j < jl; j++) {
    var layer = map.getLayer(map.layerIds[j]);
    if (dojo.indexOf(layers, layer) == -1) {
      layer.hide();
    }
  }
}

function getInitExtent(){
  var initExtent = new esri.geometry.Extent({
    "xmin": -14628212,
    "ymin": 714227,
    "xmax": 7718305,
    "ymax": 9832858,
    "spatialReference": {
      "wkid": 102100
    }
  });

  return initExtent;
}

// lat and lon in radiant since the Math-lib of JS needs rad as input!
function computeDistance(lat1, lon1, lat2, lon2){
  var angle = Math.acos(Math.sin(lat1)*Math.sin(lat2) + Math.cos(lat1)*Math.cos(lat2)*Math.cos(lon2 - lon1));
  var distance = angle * 6370;

  return distance;
}

function computeRad(degree){
  return degree * Math.PI / 180;
}