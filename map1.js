const sidebar = document.querySelector("#sidebar");

// check if the device is mobile
const isMobile = window.innerWidth <= 768 ? true : false;

// create a button that makes the sidebar visible and creates the form input
const addNew = document.createElement("button");
addNew.textContent = isMobile ? "+" : "+ Add new feature";
addNew.classList.add("add-new");

// establish a global variable to store the form input of each form
const formInput = [];

// add listener to add new form on click of addnew
addNew.addEventListener("click", () => {
  const newForm = document.createElement("form");

  //   add the form to formInput array
  formInput.push(newForm);

  newForm.classList.add("submit-form");

  const currentSelect = document.querySelector("#selected");
  if (!currentSelect) {
    newForm.id = "selected";
  }

  // add onclick function for form that adds a new object to the newFeatureObjects array
  newForm.addEventListener("click", (e) => {
    // if a different form has been selected, remove the selected class
    if (currentSelect && currentSelect !== e.target) {
      currentSelect.id = "";
    }
    newForm.id = "selected";
  });

  //   add a cancel button to the form
  const cancel = document.createElement("button");
  cancel.textContent = "- Cancel";
  cancel.classList.add("cancel");
  cancel.addEventListener("click", () => {
    // if the form is selected, reassign the selected class to the first form
    if (newForm.id === "selected") {
      const forms = document.querySelectorAll(".submit-form");
      forms[0].id = "selected";
    }
    newForm.remove();
    map.getSource("requests").setData({
      type: "FeatureCollection",
      features: [],
    });
    // clear the values
    formInput.forEach((form) => {
      form.reset();
    });
    console.log("bye");
  });

  // add the exit to the form
  newForm.appendChild(cancel);

  // add a short description to the sidebar to explain how the user should fill out the form
  const description = document.createElement("a");
  description.id = "description";
  description.textContent = "Click on the map to start adding new features.";
  description.classList.add("description");
  newForm.appendChild(description);

  //   add three inputs to the form based on an array of objects and a submit button
  const inputs = [
    {
      placeholder: "Description",
      type: "textarea",
    },
    {
      placeholder: "Feature Type",
      type: "select",
    },
    {
      placeholder: "Coordinates",
      type: "textarea",
    },
    {
      placeholder: "File",
      type: "file",
      accept: "image/*,.pdf",
    },
    {
      placeholder: "Submit",
      type: "submit",
      value: "Submit",
    },
  ];

  inputs.forEach((input) => {
    const inputContainer = document.createElement(input.type);
    inputContainer.setAttribute("type", input.type);

    // select geometry type from dropdown
    if (input.type === "select") {
      const options = ["Point", "Line", "Polygon"];
      options.forEach((option) => {
        const optionElement = document.createElement("option");
        optionElement.setAttribute("value", option);
        optionElement.textContent = option;
        inputContainer.appendChild(optionElement);
      });
    }

    inputContainer.setAttribute("placeholder", input.placeholder);
    inputContainer.setAttribute("name", input.placeholder);
    inputContainer.id = input.placeholder;

    //   add rows and cols
    if (input.type === "textarea") {
      inputContainer.setAttribute("rows", 3);
      inputContainer.setAttribute("cols", 30);
    }

    if (input.type === "file") {
      inputContainer.setAttribute("multiple", true);

      //   create an image upload function
      inputContainer.addEventListener("change", (e) => {
        const files = e.target.files;
        const fileArray = Array.from(files);
        fileArray.forEach((file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = document.createElement("img");
            img.src = e.target.result;
            img.classList.add("image");
            newForm.appendChild(img);
          };
          reader.readAsDataURL(file);
        });
      });
    }

    if (input.type === "submit") {
      inputContainer.setAttribute("value", input.value);
    }

    newForm.appendChild(inputContainer);
  });

  // add submit function to submit button
  newForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const description = document.querySelector("#Description").value;
    const coordinates = document.querySelector("#Coordinates").value;
    const image = document.querySelector("#Image").value;
    const newFeature = {
      type: "Feature",
      properties: {
        description: description,
        image: image,
      },
      geometry: {
        type: "Point",
        coordinates: coordinates.split(","),
      },
    };
  });

  if (!isMobile) {
    sidebar.insertBefore(newForm, addNew);
  } else {
    sidebar.appendChild(newForm);
  }
});
sidebar.appendChild(addNew);

// time to map the data
// limit the bounds to the center of philly
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
    range: [1, 7],
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
  map.addSource("requests", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [],
    },
  });

  map.addLayer({
    id: "requests",
    type: "circle",
    source: "requests",
    paint: {
      "circle-radius": 10,
      "circle-color": "#9198e5",
      "circle-stroke-width": 1,
      "circle-stroke-color": "#000000",
    },
  });

  //   add a line layer
  map.addLayer({
    id: "line",
    type: "line",
    source: "requests",
    paint: {
      "line-color": "yellow",
      "line-opacity": 0.75,
      "line-width": 5,
    },
  });
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
map.on("click", (e) => {
  //   check to see the type of feature the user wants to add from the selected form

  const selectedForm = formInput.filter((el) => {
    return el.id === "selected";
  });

  const featureType = selectedForm[0]?.getElementsByTagName("select")[0].value;
  //   create a new feature based on the type of feature the user wants to add
  if (featureType === "Point") {
    const newPointsCollection = getCoordinates(e.lngLat, selectedForm, "Point");
    map.getSource("requests").setData(newPointsCollection);
  }
  if (featureType === "Line") {
    const newPointsCollection = getCoordinates(
      e.lngLat,
      selectedForm,
      "LineString"
    );

    console.log(newPointsCollection);
    map.getSource("requests").setData(newPointsCollection);
  }
  if (featureType === "Polygon") {
    const newPointsCollection = getCoordinates(
      e.lngLat,
      selectedForm,
      "Polygon"
    );
    map.getSource("requests").setData(newPointsCollection);
  }
});

function getCoordinates(latlong, selectedForm, type = "Point") {
  const currentCorrds = Object.values(latlong).map((coord) => {
    return coord;
  });

  // get current coordinates from the selected form coordinate input
  const loggedCoordinates = selectedForm[0].querySelector("#Coordinates");

  loggedCoordinates.value =
    loggedCoordinates.value === ""
      ? `[${currentCorrds}]`
      : `${loggedCoordinates.value}, [${currentCorrds}]`;
  const newPointsCollection = {
    type: "FeatureCollection",
    features: constructObject(loggedCoordinates.value, type),
  };
  return newPointsCollection;
}

function constructObject(stringCoordinateArray, type = "Point") {
  //   convert the string of coordinates to an array of arrays
  const newPoints = [];

  const multiPointFeature = [];

  stringCoordinateArray.split(", ").map((el) => {
    const array = el
      .replace("[", "")
      .replace("]", "")
      .split(",")
      .map((elc) => Number(elc));

    if (type !== "Point") {
      multiPointFeature.push(array);
    } else {
      const newFeature = {};
      newFeature.type = "Feature";
      newFeature.properties = {};
      newFeature.geometry = {};
      newFeature.geometry.type = type;
      newFeature.geometry.coordinates = array;
      newPoints.push(newFeature);
    }
  });

  if (type !== "Point") {
    const newFeature = {};
    newFeature.type = "Feature";
    newFeature.properties = {};
    newFeature.geometry = {};
    newFeature.geometry.type = type;
    newFeature.geometry.coordinates = [multiPointFeature];
    newPoints.push(newFeature);
  }
  return newPoints;
}

// add on hover events for points on the map
// map.on("mousemove", "requests", (e) => {
//   console.log(e);
//   // Change the cursor style as a UI indicator.
//   map.getCanvas().style.cursor = "pointer";

//   // Populate the popup and set its coordinates
//   // based on the feature found.
//   const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
//     `<h3>${e.features[0].properties.description}</h3><img src="${e.features[0].properties.image}" alt="image of request" style="width: 100px; height: 100px; object-fit: cover;"/>`
//   );

//   popup.addTo(map);
// });
