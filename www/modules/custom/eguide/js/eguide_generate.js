jQuery(function($) {
	$(document).ready(function() {
		if ($("div#map_canvas2").length) {
			// var coor = [10.317928, 123.978315];
			var coor = [30.201479, 120.155908];
			var map = L.map('map_canvas2').setView(coor, 13);

			L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYm9pbGludXgiLCJhIjoiY2pkOXlybTN2MzVvbjMxcnp6dHc2NDAybyJ9.qdK7xyLfow0fwj4s4fCtDg', {
		    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
		    maxZoom: 18,
		    id: 'mapbox.streets',
		    accessToken: 'pk.eyJ1IjoiYm9pbGludXgiLCJhIjoiY2pkOXlybTN2MzVvbjMxcnp6dHc2NDAybyJ9.qdK7xyLfow0fwj4s4fCtDg'
			}).addTo(map);

			var popup = L.popup();

			var data = drupalSettings.eguide.eguide_generate_route_map.data;

			L.marker(coor).addTo(map).bindPopup('You are here.').openPopup();

			// generate map route
			var offSiteX = -0.00001532;
	    var offSiteY =  0.00005708;
	    for (var count in data) {
	    	var list = data[count].route;
	    	console.log(list);
		    for(var i in list){
		    	console.log(list[i]);
		      if(i % 3 != 0){
		          continue
		      }

		      var img = new Image();
		      img.src = data[count].icon;

		      var lat = Number(list[i].lat) + offSiteY;
		      var lon = Number(list[i].lon) - offSiteX;
		      var latlng = {lat: lat, lon: lon};

		      // Whether to display the text
		      var labelFlag = false;

		      // use custom point by image
		      // image size width<24px height<24 will be better
		      img.src = data[count].icon;

		      var opt = {
		          label: list[i].id,
		          labelFlag: labelFlag,
		          labelColor: 'black',
		          img: img
		      };

		      // use angeMaker plugin
		      var angleMarker = L.angleMarker(latlng, opt);
		      var angle = 0;
		      if(i > 0){
		          var previousLatLng = {lat: list[i-1].lat, lon:  list[i-1].lon};
		          var nextLanLng = {lat: list[i].lat, lon:  list[i].lon};

		          // get angele between A(previousPoint) and B(nextPoint)
		          angle = angleMarker.getAngle(previousLatLng, nextLanLng);
		      }
		      // set angele A -> B
		      angleMarker.setHeading(angle);
		      map.addLayer(angleMarker);
		    }
	    }
		}
	});
});