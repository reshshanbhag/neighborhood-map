
//-------------Model -------------------//
//--------------------------------------//
var map;
// Create an array of locations to be used as markers
// Source: Udacity course on google maps api
var locations = [
  {title: 'USS Midway Museum', location: {lat: 32.7137, lng: -117.1751}},
  {title: 'Coronado Bridge', location: {lat: 32.6894, lng: -117.1534}},
  {title: 'Cabrillo National Monument', location: {lat: 32.6735, lng: -117.2425}},
  {title: 'Old Town SanDiego State Historic Park', location: {lat: 32.7549, lng: -117.1979}},
  {title: 'La Jolla Cove', location: {lat: 32.8505, lng: -117.2729}},
];

var Place = function(data) {
  this.title = data.title;
  this.position = data.position;
  this.marker = data.marker;
};

//--------------- VIEW MODEL---------------//
//-----------------------------------------//
var ViewModel = function() {
  var self = this;
  this.markersList = ko.observableArray();
  self.filter_query = ko.observable('');

  // Initialize the InfoWindow
  var largeInfowindow = new google.maps.InfoWindow();

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
    var marker = new google.maps.Marker({
      position : this.position,
      map: this.map,
      title: this.title,
      animation: google.maps.Animation.DROP,
    });

    // Add a click listener for infowindow
    marker.addListener('click', function() {
      self.populateInfoWindow(this, largeInfowindow);
    });

    locations[i].marker = marker;
  }

  locations.forEach(function(markerItem) {
    self.markersList.push(new Place(markerItem))
  })
  // Filter the items using filter text
  this.filteredItems = ko.computed(function() {
    // Create a variable for the query/keyword
    var query = self.filter_query().toLowerCase();

    /* Display the whole list if there is no keyword *
    * And return all the markers                     */
    if (!query) {
        ko.utils.arrayForEach(self.markersList(), function(item) {
          item.marker.setVisible(true);
      });
      return self.markersList();
    } else {
       // Return the list that matches the query and make those markers
       // visible on the map
       return ko.utils.arrayFilter(self.markersList(), function(item) {
         var result = (item.title.toLowerCase().indexOf(self.filter_query().toLowerCase()) >= 0)
         item.marker.setVisible(result);
         return result;
       });
    }
  });

  /* When a list item is clicked, the info window is opened for the marker *
  * Also, marker icon turns yellow.                                       */
  self.setInfoWindow = function() {
    var icon = self.makeMarkerIcon('FFFF24');
    this.marker.setIcon(icon);
    self.populateInfoWindow(this.marker, largeInfowindow);
  }

  this.makeMarkerIcon = function(markerColor) {
     var markerImage = new google.maps.MarkerImage(
       'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
       '|40|_|%E2%80%A2',
       new google.maps.Size(21, 34),
       new google.maps.Point(0, 0),
       new google.maps.Point(10, 34),
       new google.maps.Size(21,34));

     return markerImage;
  }

 /* This function creates an infowindow when a marker is clicked and  *
 * and adds a wikipedia link for the attraction/marker                */
  this.populateInfoWindow = function(clickedMarker, infowindow) {
    var self = this;

    // Using the wiki media api to get the wikipedia link to the POI
    this.wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search='
                    + clickedMarker.title +
                   '&format=json&callback=wikiCallback';

    $.ajax({
      url: this.wikiUrl,
      dataType: "jsonp",
      success: function(response) {
          // This retrieves the wiki link and a description of the place
          // from the wiki
          this.articleStr = response[2];
          this.articleUrl = response[3];

          this.contentString = '<div id="content"><h1>' + clickedMarker.title +
                               '</h1><p>'+this.articleStr + '</p><p>' +
                               '<a href="'+ this.articleUrl +
                               '">Wikipedia Link Here</a></p></div>'

        // Check to make sure the infowindow is not already open on this markers
          if ( infowindow.marker != clickedMarker) {
             infowindow.marker = clickedMarker;
             infowindow.setContent(this.contentString);
             infowindow.open(map, clickedMarker);
             // Closing the infowindow, resets the marker color back to original
             infowindow.addListener('closeclick', function() {
                clickedMarker.setIcon(null);
                infowindow.marker = null;
              });
          }
      },
      error: function(response) {
        alert("Wikipedia is experiencing some technical issues. Please try again");
      }
    });
  }
}
// This function will loop through the markers array and display them all.
// Future work in progress
function showAttraction(markersList) {
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
googleError = function googleError() {
  alert("Google Maps did not load properly, pls refresh the window and try again");
};

function initMap() {
  ko.applyBindings(new ViewModel());
}


$(document).ready(function () {

    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
    });

});
