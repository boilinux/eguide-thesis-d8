jQuery(function($) {
	$(document).ready(function() {
		if ($("div#map_canvas2").length) {
			var data = drupalSettings.eguide.eguide_generate_route_map.data;
			var data2 = drupalSettings.eguide.eguide_generate_route_map.data2;

			var map = L.map('map_canvas2').setView([data2.lat, data2.lon], 13);

			L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYm9pbGludXgiLCJhIjoiY2pkOXlybTN2MzVvbjMxcnp6dHc2NDAybyJ9.qdK7xyLfow0fwj4s4fCtDg', {
		    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
		    maxZoom: 18,
		    id: 'mapbox.streets',
		    accessToken: 'pk.eyJ1IjoiYm9pbGludXgiLCJhIjoiY2pkOXlybTN2MzVvbjMxcnp6dHc2NDAybyJ9.qdK7xyLfow0fwj4s4fCtDg'
			}).addTo(map);

			var popup = L.popup();

			L.marker([data2.lat, data2.lon]).addTo(map).bindPopup('Start.').openPopup();

			// generate map route
			var offSiteX = -0.00001532;
	    var offSiteY =  0.00005708;
	    for (var count in data) {
	    	var list = data[count].route;
		    for(var i in list){
		      if(i % 3 != 0){
		          continue
		      }

		      var img = new Image();

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

		      var angleMarker = L.angleMarker(latlng, opt);
		      var angle = 0;

		      map.addLayer(angleMarker);
		    }
	    }

	    // screenshot
	    if ($('#map_canvas2').length) {
		    // print
		    $('a#edit-print').click(function(e) {
		    	e.preventDefault();

		    	$('#map-container').html2canvas({
			        onrendered: function (canvas) {
			        		var img = canvas.toDataURL("image/png");
			        		var data = JSON.stringify({"node_id": $('input[name="node_id"]').val(), "screenshot": img, 'user_id': $('input[name="user_id"]').val()});

			        		$.ajax({
								    url: '/eguide/api/generate_map',
								    dataType: 'json',
								    contentType: 'application/json; charset=UTF-8',
								    headers: {"password": "ZoqH1lhVpN3hPlo5Bwy0uqxqjiCVZet6"},
								    data: data,
								    type: 'POST',
								    success: function(result) {
								    	alert("Your file is being printed, please wait for a moment. Thank you.");
								    	location.reload();
						        },
						        error: function(result) {
						          alert('error');
						        }
									});
			        },
			        proxy: '/html2canvas-php-proxy/html2canvasproxy.php'
			    });
		    });

		    // destination
		    $('li.destination').click(function() {
		    	var lat = $(this).attr('data-lat');
		    	var lon = $(this).attr('data-lon');
		    	var latlng = L.latLng(lat, lon);
		    	var dis = L.latLng(data2.lat, data2.lon).distanceTo(latlng) / 1000;

		    	$('span.distance-value').text(dis.toFixed(2));
					
					L.marker([lat, lon]).addTo(map).bindPopup('Your destination.').openPopup();

		    	map.flyTo(latlng, 14);
		    });
	    }
		}
	});
});