jQuery(function($) {
	$(document).ready(function() {
		if ($("div#map_canvas2").length) {
			var data = drupalSettings.eguide.eguide_gmap.data;
			var data2 = drupalSettings.eguide.eguide_gmap.data2;
			var direction = '#directions';
			var transit = $('#edit-travelmode').val();
			var strokecolor = '#eeeeee';

			var map = new GMaps({
	      el: '#map_canvas2',
	      lat: data2.lat,
	      lng: data2.lon,
	      click: function(event){
          var lat = event.latLng.lat();
          var lng = event.latLng.lng();

          marker = map.renderRoute({
            origin: [data2.lat, data2.lon],
            destination: [lat, lng],
            travelMode: transit,
            strokeColor: strokecolor,
            strokeOpacity: 0.6,
            strokeWeight: 6
          }, {
            panel: direction,
            draggable: false
          });
        },
	    });

	    // start
	    map.addMarker({
	    	lat: data2.lat,
	      lng: data2.lon,
	      infoWindow: {
	      	content: "You are here!",
	      }
	    });

	    // destination
	    var marker;
	    $('li.destination').click(function() {
	    	var lat = $(this).attr('data-lat');
	    	var lon = $(this).attr('data-lon');
		
		$("html, body").animate({ scrollTop: 0 }, "slow");

	    	map.renderRoute({
          origin: [data2.lat, data2.lon],
          destination: [lat, lon],
          travelMode: transit,
          strokeColor: strokecolor,
          strokeOpacity: 0.6,
          strokeWeight: 6
        }, {
          panel: direction,
          draggable: false
        });
	    });

	    // search
	    $('a#btn-address').click(function(e) {
	    	e.preventDefault();

	    	var address = $('#edit-address').val();

	    	if (address == "") {
	    		alert('Please enter address.');
	    	}
	    	else {
	    		GMaps.geocode({
	          address: address.trim(),

	          callback: function(results, status){
	            if(status == 'OK') {
	              var latlng = results[0].geometry.location;
	              map.setCenter(latlng.lat(), latlng.lng());

	              map.renderRoute({
				          origin: [data2.lat, data2.lon],
				          destination: [latlng.lat(), latlng.lng()],
				          travelMode: transit,
				          strokeColor: strokecolor,
				          strokeOpacity: 0.6,
				          strokeWeight: 6
				        }, {
				          panel: direction,
				          draggable: false
				        });
	            }
	          }
	        });
	    	}
	    });
		}
	});
});
