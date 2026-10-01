// Find the container where the donut chart will be drawn.
const donutElement = document.querySelector("#donut-chart");
// Find the loading message for the donut chart.
const donutStatus = document.querySelector("#donut-status");
// Use a repeating set of colors for the donut slices.
const donutColors = ["#287d78", "#e36b43", "#d4a72c"];

function drawDonutChart(data) {
	// Keep the chart wide enough to show its labels.
	const chartWidth = Math.max(donutElement.clientWidth, 280);
	// Keep the chart height within a readable range.
	const chartHeight = Math.min(430, Math.max(320, chartWidth * 0.78));
	// Set the slice radius relative to the available chart area.
	const radius = Math.min(chartWidth, chartHeight) * 0.34;
	// Calculate the center point for the donut.
	const centerX = chartWidth / 2;
	const centerY = chartHeight / 2;
	// Add all energy values so the center label shows the combined average.
	const total = d3.sum(data, (row) => row.energyConsumption);

	// Create the responsive SVG drawing area.
	const svg = d3.select(donutElement)
		.append("svg")
		.attr("viewBox", `0 0 ${chartWidth} ${chartHeight}`)
		.attr("role", "presentation");

	// Move the chart origin to the center of the donut.
	const chart = svg.append("g").attr("transform", `translate(${centerX},${centerY})`);
	// Convert each energy value into an angular donut slice.
	const pie = d3.pie().sort(null).value((row) => row.energyConsumption);
	// Define the normal and enlarged shapes used by the slices.
	const arc = d3.arc().innerRadius(radius * 0.62).outerRadius(radius);
	const hoverArc = d3.arc().innerRadius(radius * 0.62).outerRadius(radius * 1.07);

	// Create one donut slice for each screen technology.
	chart.selectAll(".donut-slice")
		.data(pie(data))
		.join("path")
		.attr("class", "donut-slice")
		.attr("d", arc)
		.attr("fill", (row, index) => donutColors[index % donutColors.length])
		.on("mouseenter", function (event, row) {
			// Enlarge the selected slice and update the center labels.
			d3.select(this).attr("d", hoverArc);
			d3.select("#donut-label").text(`${row.data.energyConsumption.toFixed(0)} kWh/year`);
			d3.select("#donut-sub-label").text(`${row.data.screenTech} average`);
		})
		.on("mouseleave", function () {
			// Restore the slice and return the center labels to the total.
			d3.select(this).attr("d", arc);
			d3.select("#donut-label").text(`${total.toFixed(0)} kWh/year`);
			d3.select("#donut-sub-label").text("combined average");
		});

	// Show the combined average in the center of the donut.
	chart.append("text").attr("id", "donut-label").attr("class", "donut-label").attr("text-anchor", "middle").attr("dy", "-2px").text(`${total.toFixed(0)} kWh/year`);
	// Explain what the center number represents.
	chart.append("text").attr("id", "donut-sub-label").attr("class", "donut-sub-label").attr("text-anchor", "middle").attr("dy", "18px").text("combined average");

	// Find the HTML element where the chart legend will be created.
	const legend = d3.select("#donut-legend");
	// Create one legend row for each screen technology.
	legend.selectAll(".donut-legend-item")
		.data(data)
		.join("div")
		.attr("class", "donut-legend-item")
		.html((row, index) => `<span class="donut-legend-swatch" style="background:${donutColors[index % donutColors.length]}"></span><span>${row.screenTech}</span><strong>${row.energyConsumption.toFixed(0)}</strong>`);
}

// Load the all-size data, draw the chart, and remove the loading message.
loadScreenTechEnergyData()
	.then((data) => {
		drawDonutChart(data);
		donutStatus.remove();
	})
	.catch((error) => {
		// Show a helpful message when the CSV cannot be loaded.
		donutStatus.textContent = "The screen technology data could not be loaded. Open this page through a local web server.";
		// Log the technical error for debugging.
		console.error(error);
	});
