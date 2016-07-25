function initAutocomplete() {
  const title = document.createElement('div');
  title.className = 'title';

  //Create the map UI element. Initially hidden.
  var mapEl = document.getElementById('map');
  var map = new google.maps.Map(mapEl, {
    center: {lat: 37.778042, lng: -122.4125},
    zoom: 13,
    scrollwheel: false,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  // Create the search box UI element.
  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);
  var searchButton = document.getElementById('search-button');

  // Trigger search on button click
  searchButton.onclick = function () {
    google.maps.event.trigger(input, 'focus')
    google.maps.event.trigger(input, 'keydown', {
        keyCode: 13
    });
  };

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  // Init Service Library
  var service = new google.maps.places.PlacesService(map);

  var markers = [];
  var infowindows = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', updateMap);

  function updateMap() {
    //shows map
    if(mapEl.style.opacity === ""){
      mapEl.style.opacity = "1.0";
      mapEl.style.transition = "all 1s";
      google.maps.event.trigger(map, 'resize');

      input.style.top = "0px";
      input.style.height = "32px";
      input.style.fontSize = "1em";
      input.style.transition = "all 1s";

      searchButton.className = "after";
    }
    //Grabs all places from input.
    var places = searchBox.getPlaces();
    if (places.length === 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];

    // Clear out old listings.
    const listings = document.getElementById("listings");
    while (listings.firstChild) {
      listings.removeChild(listings.firstChild);
    }

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }

      //marker icon
      var icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      //Background-image
      let photoUrl = typeof place.photos !== 'undefined' ?
        place.photos[0].getUrl({'maxWidth': 1000, 'maxHeight': 1000}) :
        "http://nemanjakovacevic.net/wp-content/uploads/2013/07/placeholder.png";

      function _handleListingClick(thisPlace) {
        alert(thisPlace.name);
      }

      //Populate listings
      const listing = document.createElement('div');
      listing.className = 'listings';
      listing.addEventListener("click", (e)=>{handleListClick(e, place);});
      listing.innerHTML = place.name;
      const newImg = new Image;
      newImg.onload = function() {
        listing.style.backgroundImage = `url(${this.src})`;
        listing.style.backgroundSize = 'cover';
      };
      newImg.src = photoUrl;
      listings.appendChild(listing);

      // Create a marker for each place.
      const marker = new google.maps.Marker({
        map: map,
        icon: icon,
        title: place.name,
        position: place.geometry.location
      });

      //Marker add listener
      marker.addListener('click', function() {
        service.getDetails({
          placeId: place.place_id
        }, function(place, status) {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            // Create Infowindow on click.
            var infowindow = new google.maps.InfoWindow({
              pixelOffset: new google.maps.Size(-25,0),
              content: ('<div><strong>' + place.name + '</strong><br>' +
                  place.formatted_address + '</div>' + "★".repeat(Math.round(place.rating))
              + " " + "$".repeat(place.price_level
              ))
            });
            //Only keeps one window open
            infowindows.forEach((e)=>{e.close();});
            infowindows = [];
            infowindow.setPosition(marker.getPosition());
            infowindow.open(map, marker);
            infowindows.push(infowindow);
          }
        });
      });

      // Holdes all markers
      markers.push(marker);

      //Closes markers onblur
      google.maps.event.addListener(map, 'click', ()=>{infowindow.close()});

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  }

  //List onClick handler
  function handleListClick(e, place) {
    const list = e.target.className === 'listings' ? e.target : e.target.parentNode;
    if(list.style.height === '') {
      let details = list.lastChild;
      if(list.childElementCount === 0) {
        details = document.createElement('div');
        service.getDetails({
          placeId: place.place_id
        }, function(detailPlace, status) {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            // Create Infowindow on click.
            details.className = 'details';

            let content = detailPlace.formatted_address +
            "<br/>" + detailPlace.formatted_phone_number + " " +
            "★".repeat(detailPlace.rating) + " " +
            "$".repeat(detailPlace.price_level) +
            "<br/>" + detailPlace.reviews[0].text.slice(0,140) + "...";

            details.innerHTML = content;
          }
        });
      }

      details.style.height = '100px';
      details.style.display = 'flex';
      list.style.height = 'auto';
      list.style.backgroundColor = 'rgba(100,100,100,0.7)';
      list.appendChild(details);
    }else {
      list.style.height = '100px';
      list.style.height = '';
      list.style.backgroundColor = '';
      list.lastChild.style.height = '0px';
      list.lastChild.style.display = 'none';
    }
  }
}
