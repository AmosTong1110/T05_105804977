// Find the container where the bar chart will be drawn.
const barChartElement = document.querySelector("#bar-chart");
// Find the loading message for the bar chart.
const barChartStatus = document.querySelector("#bar-chart-status");
// Use a repeating set of colors for the bars.
const barColors = ["#287d78", "#e36b43", "#d4a72c"];

function drawBarChart(data) {
	// Reserve space around the chart for labels and axes.
	const margin = { top: 24, right: 24, bottom: 58, left: 72 };
	// Keep the chart wide enough for its technology labels.
	const chartWidth = Math.max(barChartElement.clientWidth, 320);
	// Keep the chart height within a readable range.
	const chartHeight = Math.min(480, Math.max(350, chartWidth * 0.58));
	// Calculate the drawable area inside the margins.
	const width = chartWidth - margin.left - margin.right;
	const height = chartHeight - margin.top - margin.bottom;
	// Find the largest energy value to size the y-axis.
	const maxEnergy = d3.max(data, (row) => row.energyConsumption);
	// Create y-axis ticks in 100 kWh steps.
	const energyTickValues = d3.range(0, Math.ceil(maxEnergy / 100) * 100 + 1, 100);

	// Create the responsive SVG drawing area.
	const svg = d3.select(barChartElement)
		.append("svg")
		.attr("viewBox", `0 0 ${chartWidth} ${chartHeight}`)
		.attr("role", "presentation");

	// Place each screen technology in an evenly spaced horizontal band.
	const x = d3.scaleBand()
		.domain(data.map((row) => row.screenTech))
		.range([0, width])
		.padding(0.34);
	// Convert energy values into vertical positions.
	const y = d3.scaleLinear()
		.domain([0, maxEnergy * 1.12])
		.nice()
		.range([height, 0]);
	// Group the plot elements and apply the chart margins.
	const plot = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

	// Draw horizontal guide lines across the chart.
	plot.append("g")
		.attr("class", "grid grid-y")
		.call(d3.axisLeft(y).tickValues(energyTickValues).tickSize(-width).tickFormat(""));
	// Draw the screen technology labels along the x-axis.
	plot.append("g")
		.attr("class", "axis axis-x")
		.attr("transform", `translate(0,${height})`)
		.call(d3.axisBottom(x));
	// Draw the labelled energy-consumption y-axis.
	plot.append("g")
		.attr("class", "axis axis-y")
		.call(d3.axisLeft(y).tickValues(energyTickValues).tickFormat((value) => `${value}`));

	// Label the horizontal axis.
	plot.append("text")
		.attr("class", "axis-label")
		.attr("x", width / 2)
		.attr("y", height + 48)
		.attr("text-anchor", "middle")
		.text("Screen technology");
	// Label the vertical axis.
	plot.append("text")
		.attr("class", "axis-label")
		.attr("transform", "rotate(-90)")
		.attr("x", -height / 2)
		.attr("y", -52)
		.attr("text-anchor", "middle")
		.text("Annual energy consumption (kWh / year)");

	// Create one tooltip shared by all bars.
	const tooltip = d3.select("body").append("div").attr("class", "tooltip");
	// Create one rectangle for each screen technology.
	plot.selectAll(".bar")
		.data(data)
		.join("rect")
		.attr("class", "bar")
		.attr("x", (row) => x(row.screenTech))
		.attr("y", (row) => y(row.energyConsumption))
		.attr("width", x.bandwidth())
		.attr("height", (row) => height - y(row.energyConsumption))
		.attr("fill", (row, index) => barColors[index % barColors.length])
		.on("mouseenter", function (event, row) {
			// Highlight the selected bar and show its average energy use.
			d3.select(this).classed("bar-active", true);
			tooltip
				.style("opacity", 1)
				.html(`<strong>${row.screenTech}</strong><span>55-inch average</span><span>${row.energyConsumption.toFixed(0)} kWh/year</span>`)
				.style("left", `${event.pageX + 14}px`)
				.style("top", `${event.pageY - 18}px`);
		})
		// Keep the tooltip beside the pointer while it moves.
		.on("mousemove", (event) => tooltip.style("left", `${event.pageX + 14}px`).style("top", `${event.pageY - 18}px`))
		.on("mouseleave", function () {
			// Remove the highlight and hide the tooltip when the pointer leaves.
			d3.select(this).classed("bar-active", false);
			tooltip.style("opacity", 0);
		});
}

// Load the 55-inch data, draw the chart, and remove the loading message.
load55InchScreenTechEnergyData()
	.then((data) => {
		drawBarChart(data);
		barChartStatus.remove();
	})
	.catch((error) => {
		// Show a helpful message when the CSV cannot be loaded.
		barChartStatus.textContent = "The 55-inch screen technology data could not be loaded. Open this page through a local web server.";
		// Log the technical error for debugging.
		console.error(error);
	});
