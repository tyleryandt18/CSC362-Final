//Width and height of map
var width = 700;
var height = 500;

var lowColor = '#f9f9f9';
var highColor = '#D42121';
var legendHeight = 140;
var legendWidth = 300;

// D3 Projection
var projection = d3.geoAlbersUsa()
  .translate([width / 2, height / 2]) // translate to center of screen
  .scale([1000]); // scale things down so see entire US

// Define path generator
var path = d3.geoPath() // path generator that will convert GeoJSON to SVG paths
  .projection(projection); // tell path generator to use albersUsa projection

// Create SVG element and append map to the SVG
var mapSvg = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Load in my states data!
var destinationData, mapJson;

// Using promise code from http://learnjsdata.com/read_data.html
Promise.all([
    d3.csv("data/destinations.csv"),
    d3.json("data/us-states.json")
  ]).then(function(data) {
    // console.log(data[0]);  // csv data
    // console.log(data[1]);  // json data
    destinationData = data[0];
    mapJson = data[1];
    createMapVis(destinationData, mapJson);
  });

// Function to update the map based on the selected column
function updateMap(column) {
    d3.select(".legend").remove();

    // Extract the column data
    var columnData = destinationData.map(function(d) { return +d[column]; });
    var minVal = d3.min(columnData);
    var maxVal = d3.max(columnData);
    var ramp = d3.scaleLinear().domain([minVal, maxVal]).range([lowColor, highColor]);
    // Update the map colors based on the selected column data
    mapSvg.selectAll("path")
        .data(mapJson.features)
        .style("fill", function(d) {
            // Find corresponding state in data
            var stateData = destinationData.find(function(s) {
                return s.state === d.properties.name;
            });
            // Check if data exists for the state and column
            if (stateData && stateData[column]) {
                return ramp(stateData[column]);
            } else {
                return "#ccc"; // fallback color
            }
        });



    // Append new legend
    var legend = d3.select("#map")
    .append("svg")
    .attr("class", "legend")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("position", "absolute")
    .style("top", "400px")  // Adjust the top position
    .style("right", "0px");  // Adjust the right position

    var defs = legend.append("defs");

    var linearGradient = defs.append("linearGradient")
        .attr("id", "linear-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");

    linearGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", highColor); // color of the gradient at 0%

    linearGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", lowColor); // color of the gradient at 100%

    legend.append("rect")
        .attr("width", 20)
        .attr("height", legendHeight - 10)
        .style("fill", "url(#linear-gradient)")
        .attr("transform", "translate(0,5)");

    var legendScale = d3.scaleLinear()
        .range([legendHeight - 10, 0])
        .domain([minVal, maxVal]);

    var legendAxis = d3.axisRight(legendScale);

    legend.append("g")
        .attr("class", "legend-axis")
        .attr("transform", "translate(20,5)")
        .call(legendAxis);

// Add tooltip
var tooltip = d3.select("#map").append("div")
.attr("class", "tooltip")
.style("opacity", 0);

    mapSvg.selectAll("path")
        .on("mouseover", function(event, d) {
            // console.log(d);
            // console.log(event);
            var stateName = d.properties.name;
            var value = (destinationData.find(function(s) { return s.state === stateName; }) || {})[column] || "N/A";

            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("<strong>" + stateName + "</strong><br/>" + column + ": " + value)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
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
            mapSvg.transition()
                .duration(750)
                .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
        });
    }

function createMapVis(destinationData, mapJson) {
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

    // Bind the initial data to the svg and create one path per GeoJSON feature
    mapSvg.selectAll("path")
        .data(mapJson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("stroke", "#fff")
        .style("stroke-width", "1");

    // Initially update the map with the "Total" column data
    updateMap("Total");
    
};
