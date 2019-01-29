var map;

/** Model **/
// Create an array of locations to be used as markers
// Source: Udacity course on google maps api
var locations = [
  {title: 'USS Midway Museum', location: {lat: 32.7137, lng: -117.1751}},
//  {title: 'San Diego Zoo', location: {lat: 32.7353, lng: -117.1490}},
  {title: 'Coronado Bridge', location: {lat: 32.6894, lng: -117.1534}},
  {title: 'Cabrillo National Monument', location: {lat: 32.6735, lng: -117.2425}},
  {title: 'Old Town SanDiego State Historic Park', location: {lat: 32.7549, lng: -117.1979}},
  {title: 'La Jolla Cove', location: {lat: 32.8505, lng: -117.2729}},
  //{title: 'Seaport Village', location: {lat: 32.7095, lng: -117.1709}}
];

var Place = function(data) {
  this.title = ko.observable(data.title);
  this.position = ko.observable(data.position);
  this.map = ko.observable(data.map);
};

// VIEW MODEL
var ViewModel = function() {
  var self = this;
  this.markersList = ko.observableArray([]);
  //self.filter_marker = ko.observable('');
  self.query = ko.observable('');
  //this.markersList=[];
  // Initialize the InfoWindow
  var largeInfowindow = new google.maps.InfoWindow();

  var stringStartsWith = function (string, startsWith) {
    string = string || "";
    if (startsWith.length > string.length)
        return false;
    return string.substring(0, startsWith.length) === startsWith;
  };

  // Constructor creates a new map - only center and zoom are required.
  this.map = new google.maps.Map(document.getElementById("map"), {
      center: {lat: 32.715736, lng: -117.161087},
      zoom: 10
    });


  // Add Markers to the map with info windows
  for (var i=0; i<locations.length; i++) {
    this.position = locations[i].location;
    this.title = locations[i].title;

    //create the marker per location and put into markers array
    this.marker = new google.maps.Marker({
      position : this.position,
      map: this.map,
      title: this.title,
      animation: google.maps.Animation.DROP,
    });

    // Add a click listener for infowindow
    this.marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });

    // Create the markers in a list VIEW by creating an array of markers
  //  locations.forEach(function(place) {
      //self.markersList.push(new Place(this.marker));
  //  });
    self.markersList.push(this.marker);
  }


  // Filter the items using filter text
  this.filteredItems = ko.computed(function() {
     //var query = self.filter_marker().toLowerCase();
    // if (!filter_marker) {
    if (!self.query) {
       console.log("i am here");
       return this.markersList();
     } else {
       console.log("now here");

         return self.markersList()
         .filter(place=>place.title.toLowerCase()===self.query().toLowerCase());
          //.filter(place=>place.title.toLowerCase().indexOf(self.query().toLowerCase()) > -1);

        //return ko.utils.arrayFilter(self.markersList, function(marker) {
          //return (marker.title.toLowerCase().indexOf(self.query().toLowerCase()) >= 0)

          //  console.log(marker.title);
          //  return marker.title;

      //  });
    }
   });
 //};
//});


  this.setInfoWindow = function(clickedMarker)
  {
      this.setIcon(makeMarkerIcon('FFFF24'));
      populateInfoWindow(clickedMarker, largeInfowindow);
  }
}

 // This function takes in a COLOR, and then creates a new marker
 // icon of that color. The icon will be 21 px wide by 34 high, have an origin
 // of 0, 0 and be anchored at 10, 34).
 function makeMarkerIcon(markerColor) {
   var markerImage = new google.maps.MarkerImage(
     'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
     '|40|_|%E2%80%A2',
     new google.maps.Size(21, 34),
     new google.maps.Point(0, 0),
     new google.maps.Point(10, 34),
     new google.maps.Size(21,34));

   return markerImage;

 }

//This function populates the infowindow when the marker is clicked
function populateInfoWindow(marker, infowindow) {
  var self = this;

  // Using the wiki media api to get the wikipedia link to the POI
  this.wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title +
      '&format=json&callback=wikiCallback';

  $.ajax({
    url: wikiUrl,
    dataType: "jsonp",
    success: function(response) {
      // This retrieves the wiki link and a description of the place from the wiki
      this.articleStr = response[2];
      this.articleUrl = response[3];

      this.contentString = '<div id="content"><h1>' + marker.title +
                          '</h1><p>'+this.articleStr + '</p><p>' +
                          '<a href="'+this.articleUrl+'">Wikipedia Link Here</a></p></div>'

      // Check to make sure the infowindow is not already open on this markers
      if (infowindow.marker != marker) {
        infowindow.marker = marker;
        infowindow.setContent(this.contentString);
        infowindow.open(map, marker);
        infowindow.addListener('closeclick', function() {
          infowindow.marker = null;
        });
      }
    }
  });

}

// This function will loop through the markers array and display them all.

function showAttraction() {
  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}

// This function will loop through the listings and hide them all.

function hideAttractions() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}


// VIEW
function initMap() {
  ko.applyBindings(new ViewModel());
}
