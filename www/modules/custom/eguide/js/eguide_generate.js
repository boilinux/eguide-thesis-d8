jQuery(function($) {
	$(document).ready(function() {
		if ($("div#map_canvas2").length) {
			// var coor = [10.317928, 123.978315];
			var coor = [30.201479, 120.155908];
			var map = L.map('map_canvas2').setView(coor, 13);

			L.tileLayer('https://api.tiles.mapbox.com/v4/mapbox.dark/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        maxZoom: 13,
		    id: 'mapbox.streets',
		    // accessToken: 'pk.eyJ1IjoiYm9pbGludXgiLCJhIjoiY2pkOXlybTN2MzVvbjMxcnp6dHc2NDAybyJ9.qdK7xyLfow0fwj4s4fCtDg'
			}).addTo(map);

			var popup = L.popup();

			var data = drupalSettings.eguide.eguide_generate_route_map.data;

			L.marker(coor).addTo(map).bindPopup('You are here.').openPopup();

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
		    $('a#take-screenshot').click(function(e) {
		    	e.preventDefault();

          $('#container-screenshot').prepend("<div class='alert alert-success fade in alert-dismissable'>Screenshot, Done. You can now print.</div>");
          $('a#take-screenshot').hide();
          $('#edit-print').attr('style', 'display:block;');
		    	
		    });

		    // print
		    $('a#edit-print').click(function(e) {
		    	e.preventDefault();

		    	$('#map_canvas2').html2canvas({
			        onrendered: function (canvas) {
			        		var img = canvas.toDataURL("image/png");
			        		var data = JSON.stringify({"screenshot": img, 'user_id': $('input[name="user_id"]').val()});
			        		
			        		$('#edit-screenshot2').val(img);

			        		$.ajax({
								    url: '/eguide/api/generate_map',
								    dataType: 'json',
								    contentType: 'application/json; charset=UTF-8', // This is the money shot
								    headers: {"password": "ZoqH1lhVpN3hPlo5Bwy0uqxqjiCVZet6"},
								    data: data,
								    type: 'POST',
								    success: function(result) {

						        },
						        error: function(result) {
						          alert('error');
						        }
									});
			        },
			        proxy: '/html2canvas-php-proxy/html2canvasproxy.php'
			    });
		    });
	    }
		}
	});
});