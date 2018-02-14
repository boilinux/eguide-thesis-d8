jQuery(function($) {
	$(document).ready(function() {
		if ($("div#map_canvas").length) {
			var data = drupalSettings.eguide.eguide_map.data;

			var coor = [data.lat, data.lon];
			var map = L.map('map_canvas').setView(coor, 14);

			L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYm9pbGludXgiLCJhIjoiY2pkOXlybTN2MzVvbjMxcnp6dHc2NDAybyJ9.qdK7xyLfow0fwj4s4fCtDg', {
		    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
		    maxZoom: 18,
		    id: 'mapbox.streets',
		    accessToken: 'pk.eyJ1IjoiYm9pbGludXgiLCJhIjoiY2pkOXlybTN2MzVvbjMxcnp6dHc2NDAybyJ9.qdK7xyLfow0fwj4s4fCtDg'
			}).addTo(map);

			var popup = L.popup();

			function onMapClick(e) {
				popup
        .setLatLng(e.latlng)
        .setContent(e.latlng.toString())
        .openOn(map);
			}

			function onMapClickGuest(e) {
				popup
        .setLatLng(e.latlng)
        .setContent("How to get here?")
        .openOn(map);

        var where = e.latlng.wrap();

        $('input#edit-destination').val('{"lat":' + where.lat + ',"lon":' + where.lng + '}');
        $('input#edit-distance').val(e.latlng.distanceTo(coor));
			}
			// Admin guide
			if ($("div#toolbar-administration").length) {
				map.on('click', onMapClick);
			}
			else {
				map.on('click', onMapClickGuest);
			} 

			L.marker(coor).addTo(map).bindPopup('Start.').openPopup();
		}
	});
});