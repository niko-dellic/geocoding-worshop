const sidebar = document.querySelector("#sidebar");

// check if the device is mobile
const isMobile = window.innerWidth <= 768 ? true : false;

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

// stylize the globe effect
map.on("style.load", () => {
  map.setFog({
    range: [2, 2],
    color: "#d6fffc",
    // color: "#aaf0d1",
    "horizon-blend": 0.03,
    "high-color": "#000000",
    "space-color": "#000000",
    "star-intensity": 0,
  });
});

const pointData = [phillyCenter];
// add source after map load
map.on("load", () => {
  // Add a geojson point source.
  // Heatmap layers also work with a vector tile source.
  map.addSource("earthquakes", {
    type: "geojson",
    data: "https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson",
  });

  map.addSource("requests", {
    type: "circle",
    data: pointData,
  });

  map.addLayer({
    id: "requests",
    type: "circle",
    source: "requests",
  });

  map.addLayer(
    {
      id: "earthquakes-heat",
      type: "heatmap",
      source: "earthquakes",
      maxzoom: 9,
      paint: {
        // Increase the heatmap weight based on frequency and property magnitude
        "heatmap-weight": [
          "interpolate",
          ["linear"],
          ["get", "mag"],
          0,
          0,
          6,
          1,
        ],
        // Increase the heatmap color weight weight by zoom level
        // heatmap-intensity is a multiplier on top of heatmap-weight
        "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 9, 3],
        // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
        // Begin color ramp at 0-stop with a 0-transparancy color
        // to create a blur-like effect.
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(33,102,172,0)",
          0.2,
          "rgb(103,169,207)",
          0.4,
          "rgb(209,229,240)",
          0.6,
          "rgb(253,219,199)",
          0.8,
          "rgb(239,138,98)",
          1,
          "rgb(178,24,43)",
        ],
        // Adjust the heatmap radius by zoom level
        "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 2, 9, 20],
        // Transition from heatmap to circle layer by zoom level
        "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 7, 1, 9, 0],
      },
    },
    "waterway-label"
  );

  map.addLayer(
    {
      id: "earthquakes-point",
      type: "circle",
      source: "earthquakes",
      minzoom: 7,
      paint: {
        // Size circle radius by earthquake magnitude and zoom level
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          7,
          ["interpolate", ["linear"], ["get", "mag"], 1, 1, 6, 4],
          16,
          ["interpolate", ["linear"], ["get", "mag"], 1, 5, 6, 50],
        ],
        // Color circle by earthquake magnitude
        "circle-color": [
          "interpolate",
          ["linear"],
          ["get", "mag"],
          1,
          "rgba(33,102,172,0)",
          2,
          "rgb(103,169,207)",
          3,
          "rgb(209,229,240)",
          4,
          "rgb(253,219,199)",
          5,
          "rgb(239,138,98)",
          6,
          "rgb(178,24,43)",
        ],
        "circle-stroke-color": "white",
        "circle-stroke-width": 1,
        // Transition from heatmap to circle layer by zoom level
        "circle-opacity": ["interpolate", ["linear"], ["zoom"], 7, 0, 8, 1],
      },
    },
    "waterway-label"
  );
});

const geocoder = new MapboxGeocoder({
  // Initialize the geocoder
  accessToken: mapboxgl.accessToken, // Set the access token
  mapboxgl: mapboxgl, // Set the mapbox-gl instance
  marker: false, // Do not use the default marker style
  placeholder: "Search Philladelphia", //placeholer text for the search bar
  bbox: phillyBounds, //limit search results to Philadelphia bounds
});

// Add the geocoder to the map
map.addControl(geocoder);

// add event listener to the map that provides the lat and long of my click
const newPoints = [];

map.on("mouseup", (e) => {
  // add new marker to new points
  newPoints.push(e.lngLat);

  const marker = new mapboxgl.Marker() // initialize a new marker
    .setLngLat(e.lngLat) // Marker [lng, lat] coordinates
    .addTo(map); // Add the marker to the map

  const shrinkAxis = isMobile ? "height" : "width";

  sidebar.style[shrinkAxis] = "25rem";
});

map.on("mousedown", (e) => {
  // create a new market at the click location and then draw a line between the points
  const shrinkAxis = isMobile ? "height" : "width";

  sidebar.style[shrinkAxis] = "0rem";
});
