# Place Search

[live][github]

[github]: http://mikqmas.github.io/placeSearch

Place Search is a front-end project showcasing Javascript and CSS. The website uses vanilla JS and Google Maps Places API to dynamically update page with search results, parsed from the JSON response.

## Features & Implementation

### Single-Page App

Place Search is truly a single-page; all content is delivered on one static page leveraging AJAX. Google Maps Places return JSON objects, which populate the group of listings.

```javascript
  const listing = document.createElement('div');
  listing.className = 'listings';
  listing.addEventListener("click", (e)=>{handleListClick(e, place);});
  listing.innerHTML = place.name;
```

### AJAX
To create a seamless UX, AJAX requests fired by the Google Maps Places API is rendered using Javascript. DOM manipulation was purposefully done with plain old Javascript and not jQuery to avoid unnecessary bloat.

### Loading
Loading the photos take seconds, which can disrupt user experience. Javascript `onload` is used to display a loading animation until the image is fully loaded.

```javascript
  const newImg = new Image;
  newImg.onload = function() {
    listing.style.backgroundImage = `url(${this.src})`;
    listing.style.backgroundSize = 'cover';
  };
  newImg.src = photoUrl;
```

### Mobile Responsive Design
Styling is optimize for both viewing on mobile or desktop, reducing the size of images and text according to a max width.

```css
@media (max-width: 600px) {
  .listings {
    font-size: 1.5em;
  }
  .details {
    font-size: 15px;
  }
}
```

### Code Overview

Binds the search button to trigger `places_changed` API call.

```javascript
searchButton.onclick = function () {
  google.maps.event.trigger(input, 'focus')
  google.maps.event.trigger(input, 'keydown', {
      keyCode: 13
  });
};
```

`updateMap` function is called anytime a `places_changed` gets triggered.

Initially the map opacity is set to 0. Once the initial search is triggered, the inline css is injected to reveal the map.
```javascript
if(mapEl.style.opacity === ""){
  mapEl.style.opacity = "1.0";
```

required to rerender map when size of the map is changed.

```javascript
google.maps.event.trigger(map, 'resize');
```

SearchBox of the Places API grabs the JSON response of the suggested places.
```javascript
var places = searchBox.getPlaces();
```

Creating a list of each place from the response.
```javascript
const listing = document.createElement('div');
listing.className = 'listings';
listing.addEventListener("click", (e)=>{handleListClick(e, place);});
listing.innerHTML = place.name;
```

Showing a loading gif while waiting for the image to load.
```javascript
const newImg = new Image;
newImg.onload = function() {
  listing.style.backgroundImage = `url(${this.src})`;
  listing.style.backgroundSize = 'cover';
};
newImg.src = photoUrl;
```

OnClick of a map marker, triggers request for more detail from Places API and displaying results in an `infowindow`. Similarly handled with the listOnClickHandler.

```javascript
marker.addListener('click', function() {
  service.getDetails({
    placeId: place.place_id
  }, function(place, status) {...})});
```
