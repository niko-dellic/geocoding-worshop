const phillyBounds = [-75.280266, 39.867004, -74.955763, 40.137992];
// get philly center by averaging the bounds
const phillyCenter = [
  (phillyBounds[0] + phillyBounds[2]) / 2,
  (phillyBounds[1] + phillyBounds[3]) / 2,
];

mapboxgl.accessToken =
  "pk.eyJ1Ijoibmlrby1kZWxsaWMiLCJhIjoiY2w5c3p5bGx1MDh2eTNvcnVhdG0wYWxkMCJ9.4uQZqVYvQ51iZ64yG8oong";
const map = new mapboxgl.Map({
  container: "map", // Container ID
  style: "mapbox://styles/niko-dellic/cl9t226as000x14pr1hgle9az", // Map style to use
  center: phillyCenter, // Starting position [lng, lat]
  zoom: 12, // Starting zoom level
  projection: "globe",
});

const marker = new mapboxgl.Marker() // initialize a new marker
  .setLngLat(phillyCenter) // Marker [lng, lat] coordinates
  .addTo(map); // Add the marker to the map

const geocoder = new MapboxGeocoder({
  // Initialize the geocoder
  accessToken: mapboxgl.accessToken, // Set the access token
  mapboxgl: mapboxgl, // Set the mapbox-gl instance
  marker: false, // Do not use the default marker style
  placeholder: "Search Philly", //placeholer text for the search bar
  //   bbox: [-122.30937, 37.84214, -122.23715, 37.89838], // Boundary for Berkeley
  bbox: phillyBounds,
  //   proximity: {
  //     longitude: -122.25948,
  //     latitude: 37.87221,
  //   }, // Coordinates of UC Berkeley
});

// Add the geocoder to the map
map.addControl(geocoder);
// map.onLoad(() => {
//   map.setFog();
// });

// add event listener to the map that provides the lat and long of my click
const newPoints = [];
map.on("click", (e) => {
  // create a new market at the click location and then draw a line between the points

  // add new marker to new points
  newPoints.push(e.lngLat);

  const marker = new mapboxgl.Marker() // initialize a new marker
    .setLngLat(e.lngLat) // Marker [lng, lat] coordinates
    .addTo(map); // Add the marker to the map
});
