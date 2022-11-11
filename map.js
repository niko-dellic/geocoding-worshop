document.addEventListener("contextmenu", (event) => event.preventDefault()); //disable right click for map

// api key to access JotForm
JF.initialize({ apiKey: "336b42c904dd34391b7e1c055286588b" });

// Import Layers

// mapbox access token
mapboxgl.accessToken =
  "pk.eyJ1Ijoibmlrby1kZWxsaWMiLCJhIjoiY2w5c3p5bGx1MDh2eTNvcnVhdG0wYWxkMCJ9.4uQZqVYvQ51iZ64yG8oong";

// time to map the data
// limit the bounds to the center of philly
const phillyBounds = [-75.280266, 39.867004, -74.955763, 40.137992];
const bostonBounds = [-71.191247, 42.227911, -70.648072, 42.450118];
// get philly center by averaging the bounds
const phillyCenter = [
  (phillyBounds[0] + phillyBounds[2]) / 2,
  (phillyBounds[1] + phillyBounds[3]) / 2,
];

const bostonCenter = [
  (bostonBounds[0] + bostonBounds[2]) / 2,
  (bostonBounds[1] + bostonBounds[3]) / 2,
];

mapboxgl.accessToken =
  "pk.eyJ1Ijoibmlrby1kZWxsaWMiLCJhIjoiY2w5c3p5bGx1MDh2eTNvcnVhdG0wYWxkMCJ9.4uQZqVYvQ51iZ64yG8oong";
const map = new mapboxgl.Map({
  container: "map", // Container ID
  style: "mapbox://styles/niko-dellic/cl9t226as000x14pr1hgle9az", // Map style to use
  center: bostonCenter, // Starting position [lng, lat]
  zoom: 12, // Starting zoom level
  projection: "globe",
});

// stylize the globe effect
map.on("style.load", () => {
  map.setFog({
    range: [1, 7],
    color: "#d6fffc",
    // color: "#aaf0d1",
    "horizon-blend": 0.03,
    "high-color": "#000000",
    "space-color": "#000000",
    "star-intensity": 0,
  });
});

const geocoder = new MapboxGeocoder({
  // Initialize the geocoder
  accessToken: mapboxgl.accessToken, // Set the access token
  mapboxgl: mapboxgl, // Set the mapbox-gl instance
  placeholder: "Search Boston", //placeholer text for the search bar
  bbox: bostonBounds, //limit search results to Philadelphia bounds
});

const reverseGeocoder = new MapboxGeocoder({
  // Initialize the geocoder
  accessToken: mapboxgl.accessToken, // Set the access token
  mapboxgl: mapboxgl, // Set the mapbox-gl instance
  reverseGeocode: true,
});

// Add the geocoder to the map
map.addControl(geocoder);
// map.addControl(reverseGeocoder);

// get form submissions from JotForm Format: (formID, callback)

function getSubmissions() {
  JF.getFormSubmissions("223144210321032", function (responses) {
    console.log(responses);
    // array to store all the submissions: we will use this to create the map
    const submissions = [];
    // for each responses
    for (var i = 0; i < responses.length; i++) {
      // create an object to store the submissions and structure as a json
      const submissionProps = {};

      submissionProps["type"] = "Feature";
      submissionProps["geometry"] = {
        type: "Point",
      };
      submissionProps["properties"] = {};

      // add all fields of responses.answers to our object
      const keys = Object.keys(responses[i].answers);
      keys.forEach((answer) => {
        let currentAnswer = responses[i].answers[answer].answer;
        if (!currentAnswer) {
          // delete the key if the answer is empty
          delete responses[i].answers[answer];
          return;
        }
        const lookup = "name";
        const entry = responses[i].answers[answer].name;

        if (entry === "latitude" || entry === "longitude") {
          currentAnswer = parseFloat(currentAnswer);
        }

        submissionProps.properties[responses[i].answers[answer][lookup]] =
          currentAnswer;
      });

      submissionProps.geometry["coordinates"] = [
        submissionProps.properties.longitude,
        submissionProps.properties.latitude,
      ];

      // add submission to submissions array
      submissions.push(submissionProps);
    }

    // see if the source exists
    if (map.getSource("submissions")) {
      // update the source
      map.getSource("submissions").setData({
        type: "FeatureCollection",
        features: submissions,
      });
    }

    // add source after map load
    map.on("load", () => {
      map.addSource("submissions", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: submissions,
        },
      });

      map.addLayer({
        id: "submissions",
        type: "circle",
        source: "submissions",
        paint: {
          "circle-radius": 10,
          "circle-color": "#9198e5",
          "circle-stroke-width": 1,
          "circle-stroke-color": "#000000",
        },
      });
    });
  });
}

getSubmissions();

const hoverPopup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false,
});

const popup = new mapboxgl.Popup({
  closeButton: true,
  closeOnClick: true,
});

// add a hover event that shows a hoverPopup with the description
map.on("mouseenter", "submissions", (e) => {
  // Change the cursor style as a UI indicator.
  map.getCanvas().style.cursor = "pointer";

  const coordinates = e.features[0].geometry.coordinates.slice();

  const htmlContainer = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = e.features[0].properties.placeName;

  const description = document.createElement("p");
  description.innerHTML = e.features[0].properties.description;

  htmlContainer.appendChild(title);
  htmlContainer.appendChild(description);

  // Ensure that if the map is zoomed out such that multiple
  // copies of the feature are visible, the hoverPopup appears
  // over the copy being pointed to.
  while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
  }

  // Populate the hoverPopup and set its coordinates
  // based on the feature found.

  hoverPopup.setLngLat(coordinates).setHTML(htmlContainer.outerHTML).addTo(map);
});

// hide the hoverPopup when the mouse leaves the layer
map.on("mouseleave", "submissions", () => {
  map.getCanvas().style.cursor = "";
  hoverPopup.remove();
});

// create a global timeout that can be used to clear the timeout
let timeout;

// on click of the map add a new point to the map
map.on("click", (e) => {
  // createa new geojson object from click
  const newPoint = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [e.lngLat.lng, e.lngLat.lat],
    },
    properties: {
      description: "new point",
    },
  };

  //   add a new point to the map
  if (map.getSource("newPoint")) {
    map.getSource("newPoint").setData(newPoint);
  } else {
    map.addSource("newPoint", {
      type: "geojson",
      data: newPoint,
    });

    // add a new layer to the map
    map.addLayer({
      id: "newPoint",
      type: "circle",
      source: "newPoint",
      paint: {
        "circle-radius": 10,
        "circle-color": "#f30",
        "circle-stroke-width": 1,
        "circle-stroke-color": "#000000",
      },
    });
  }

  //make callback function on submit to update the new point with the description and then submit to jotform
  const updateDescription = (location) => {
    // clear the existing timeout
    clearTimeout(timeout);

    // get the description from the input
    const description = document.getElementById("description").value;
    newPoint.properties.description = description;
    newPoint.properties.placeName = location;

    map.getSource("newPoint").setData(newPoint);
    popup.remove();

    // add a new jotform submission
    const submission = new Object();

    // name
    submission[3] = newPoint.properties.name;
    // email
    submission[4] = newPoint.properties.email;
    // place name
    submission[5] = newPoint.properties.placeName;
    // latitude
    submission[6] = newPoint.geometry.coordinates[1];
    // longitude
    submission[7] = newPoint.geometry.coordinates[0];
    // description
    submission[9] = newPoint.properties.description;

    JF.createFormSubmission("223144210321032", submission, function (response) {
      console.log("submission response", response);

      // assign a timeout to the global timeout variable
      timeout = setTimeout(() => {
        getSubmissions();
      }, 2000);
    });
  };

  async function getLocationName() {
    // reverse geocode the point using fetch
    await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${e.lngLat.lng},${e.lngLat.lat}.json?access_token=${mapboxgl.accessToken}`
    )
      .then((response) => response.json())
      .then((data) => {
        const location = data.features[0].place_name
          .split(",")
          .slice(0, 2)
          .join(",");

        //   add a popup to the new point with a textarea input field
        const htmlContainer = document.createElement("div");
        const title = document.createElement("h3");
        title.textContent = location;

        const textarea = document.createElement("textarea");
        textarea.id = "description";
        textarea.placeholder = "description";
        textarea.style.resize = "none";

        // create submit button
        const submitButton = document.createElement("button");
        submitButton.id = "submit";
        submitButton.textContent = "Submit";

        htmlContainer.appendChild(title);
        htmlContainer.appendChild(textarea);
        htmlContainer.appendChild(submitButton);

        popup
          .setLngLat([e.lngLat.lng, e.lngLat.lat])
          .setHTML(htmlContainer.outerHTML)
          .addTo(map);

        // get the newly added submit button and add a click event
        const appendedSubmitButton = document.getElementById("submit");
        appendedSubmitButton.addEventListener("click", function () {
          updateDescription(location);
        });
      });
  }
  getLocationName();
});

// close popup on escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    popup.remove();
  }
});
