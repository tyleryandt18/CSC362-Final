// Width and height of map

var width = 960;
var height = 500;

var lowColor = '#f9f9f9';
var highColor = '#D42121';

// D3 Projection
var projection = d3.geoAlbersUsa()
  .translate([width / 2, height / 2]) // translate to center of screen
  .scale([1000]); // scale things down so see entire US

// Define path generator
var path = d3.geoPath() // path generator that will convert GeoJSON to SVG paths
  .projection(projection); // tell path generator to use albersUsa projection

// Create SVG element and append map to the SVG
var svgMap = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

let mapData, json;

// const getData = () => {
//     let mapData = [];
//     d3.csv("data/destinations.csv", data => mapData.push(data));
//     return mapData;
// }

// mapData = getData();
// console.log(mapData);

d3.csv("data/destinations.csv", function(mapData_) {
        mapData = mapData_;

        console.log('Davin');
        console.log(mapData);
    // Load GeoJSON data and merge with states data

    d3.json("data/us-states.json", function(json_) {
        json = json_;

        // Add buttons for filtering data
        console.log('tyler');
        var buttons = d3.select("#buttons-container")
            .append("div")
            .attr("class", "buttons");

        buttons.append("button")
            .text("Total")
            .on("click", function() {
                updateMap("Total");
            });

        buttons.append("button")
            .text("2023")
            .on("click", function() {
                updateMap("2023");
            });

        buttons.append("button")
            .text("2022")
            .on("click", function() {
                updateMap("2022");
            });

        buttons.append("button")
            .text("2021")
            .on("click", function() {
                updateMap("2021");
            });

        // Function to update the map based on the selected column
        function updateMap(column) {
            // Extract the column data
            var columnData = mapData.map(function(d) { return +d[column]; });
            var minVal = d3.min(columnData);
            var maxVal = d3.max(columnData);
            var ramp = d3.scaleLinear().domain([minVal, maxVal]).range([lowColor, highColor]);
        // var ramp = d3.scaleSequential(d3.interpolateBlues).domain([minVal, maxVal]).range([lowColor, highColor]);
        
            // Update the map colors based on the selected column data
            svgMap.selectAll("path")
                .data(json.features)
                .style("fill", function(d) {
                    // Find corresponding state in data
                    var stateData = mapData.find(function(s) {
                        return s.state === d.properties.name;
                    });
                    // Check if data exists for the state and column
                    if (stateData && stateData[column]) {
                        return ramp(stateData[column]);
                    } else {
                        return "#ccc"; // fallback color
                    }
                });

            // Add tooltip
            var tooltip = d3.select("#map").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            svgMap.selectAll("path")
                .on("mouseover", function(d) {
                    var stateName = d.properties.name;
                    var value = (mapData.find(function(s) { return s.state === stateName; }) || {})[column] || "N/A";

                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html("<strong>" + stateName + "</strong><br/>" + column + ": " + value)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                })
                .on("mouseout", function(d) {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                })
                .on("click", function(d) {
                    // Get bounding box of clicked state
                    var bounds = path.bounds(d);
                    // Calculate the scale to fit the state
                    var dx = bounds[1][0] - bounds[0][0];
                    var dy = bounds[1][1] - bounds[0][1];
                    var scale = 0.9 / Math.max(dx / width, dy / height);
                    // Calculate the translate to center the state
                    var x = (bounds[0][0] + bounds[1][0]) / 2;
                    var y = (bounds[0][1] + bounds[1][1]) / 2;
                    var translate = [width / 2 - scale * x, height / 2 - scale * y];
                    // Apply zoom transition
                    svgMap.transition()
                        .duration(750)
                        .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
                });
        }

        // Zoom function
        var zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", function() {
                svgMap.selectAll("path").attr("transform", d3.event.transform);
            });

        svgMap.call(zoom);

        // Add zoom in and zoom out buttons
        var zoomButtons = d3.select("#buttons-container")
            .append("div")
            .attr("class", "zoom-buttons");

        zoomButtons.append("button")
            .text("+")
            .on("click", function() {
                zoom.scaleBy(svgMap.transition().duration(500), 1.2);
            });

        zoomButtons.append("button")
            .text("-")
            .on("click", function() {
                zoom.scaleBy(svgMap.transition().duration(500), 0.8);
            });

        // Bind the initial data to the SVG and create one path per GeoJSON feature
        svgMap.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("stroke", "#fff")
            .style("stroke-width", "1");

        // Initially update the map with the "Total" column data
        updateMap("Total");
    }).catch(error => console.error(error));
}).catch(error => console.error(error));
