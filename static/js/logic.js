// Create the base tile layer (Mapbox Streets)
let basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Create the map object with a center and zoom level.
let map = L.map("map", {
  center: [20, 0], // Central position (adjust as needed)
  zoom: 2,
  layers: [basemap]
});

// Function to determine marker color based on earthquake depth
// function getColor(depth) {
//   return depth > 90 ? "#800026" :
//          depth > 70 ? "#BD0026" :
//          depth > 50 ? "#E31A1C" :
//          depth > 30 ? "#FC4E2A" :
//          depth > 10 ? "#FD8D3C" :
//                       "#FEB24C";
// }
function getColor(depth) {
  return depth > 300 ? "#8B0000" :  // Very Deep - Dark Red
         depth > 200 ? "#B22222" :  // Deep - Firebrick Red
         depth > 150 ? "#FF4500" :  // Medium-Deep - Orange Red
         depth > 100 ? "#FF8C00" :  // Shallow-Medium - Dark Orange
         depth > 70  ? "#FFD700" :  // Shallow - Gold Yellow
         depth > 50  ? "#ADFF2F" :  // Very Shallow - Green Yellow
                      "#008000";    // Surface - Green
}


// Function to determine marker size based on magnitude
function getRadius(magnitude) {
  return magnitude === 0 ? 1 : magnitude * 4;
}

// Function to style each marker
function styleInfo(feature) {
  return {
    radius: getRadius(feature.properties.mag),
    fillColor: getColor(feature.geometry.coordinates[2]), // Depth is the third coordinate
    color: "#000",
    weight: 0.5,
    opacity: 1,
    fillOpacity: 0.8
  };
}

// Load earthquake data from USGS GeoJSON feed
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {
  
  // Create a GeoJSON layer with the data
  let earthquakes = L.geoJson(data, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleInfo,
    onEachFeature: function (feature, layer) {
      layer.bindPopup(`<strong>Location:</strong> ${feature.properties.place}<br>
                       <strong>Magnitude:</strong> ${feature.properties.mag}<br>
                       <strong>Depth:</strong> ${feature.geometry.coordinates[2]} km`);
    }
  });

  // Add earthquake layer to the map
  earthquakes.addTo(map);

  // Create legend control
  let legend = L.control({ position: "bottomright" });

  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend"),
        depths = [-10, 10, 30, 50, 70, 90],
        labels = [];

    div.innerHTML += "<h4>Depth (km)</h4>";

    for (let i = 0; i < depths.length; i++) {
      div.innerHTML +=
        '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
        depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
    }

    return div;
  };

  legend.addTo(map);

  // OPTIONAL: Add tectonic plates layer
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plateData) {
    let tectonicPlates = L.geoJson(plateData, {
      color: "orange",
      weight: 2
    });

    tectonicPlates.addTo(map);
  });
});
