// Find the HTML element where the scatter plot will be drawn.
const chartElement = document.querySelector("#chart");
// Find the loading message so it can be removed after the data arrives.
const chartStatus = document.querySelector("#chart-status");

function drawScatterPlot(data) {
	// Reserve space around the chart for labels and axes.
	const margin = { 
		top: 30,
		bottom: 70,
		right: 0,
		left: 60
	};

	// Keep the chart wide enough to read on small screens.
	const chartWidth = Math.max(chartElement.clientWidth, 320);
	// Keep the chart height within a useful range while preserving its proportions.
	const chartHeight = Math.min(560, Math.max(390, chartWidth * 0.58));
	// Calculate the drawable area inside the margins.
	const width = chartWidth - margin.left - margin.right;
	const height = chartHeight - margin.top - margin.bottom;
	// Find the highest energy value so the y-axis can cover every point.
	const maxEnergy = d3.max(data, (row) => row.energyConsumption);
	// Mathematics formula that create evenly spaced y-axis tick values in 200 kWh steps. 
	const energyTickValues = d3.range(0, Math.ceil(maxEnergy / 200) * 200 + 1, 200);
	//d3. range(start, stop, step) creates an array of evenly spaced numbers. "d3.range(0, 1001, 200);"

	// Create the SVG drawing area and make it responsive through its viewBox.
	const svg = d3.select(chartElement)
		.append("svg")
		.attr("viewBox", `0 0 ${chartWidth} ${chartHeight}`)
		.attr("role", "presentation");

	// Convert star-rating values into horizontal positions.
	const x = d3.scaleLinear()
		.domain([d3.min(data, (row) => row.starRating) - 0.5, d3.max(data, (row) => row.starRating) + 0.5])
		.range([0, width]);
	// Convert energy-consumption values into vertical positions.
	const y = d3.scaleLinear()
		.domain([0, maxEnergy * 1.05])
		.range([height, 0]);

	// Group all plot elements so the margins can be applied together.
	const plot = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

	// Draw vertical grid lines from the x-axis tick positions.
	plot.append("g")
		.attr("class", "grid grid-x")
		.attr("transform", `translate(0,${height})`)
		.call(d3.axisBottom(x).tickValues(d3.range(2, 9)).tickSize(-height).tickFormat(""));
	// Draw horizontal grid lines from the y-axis tick positions.
	plot.append("g")
		.attr("class", "grid grid-y")
		.call(d3.axisLeft(y).tickValues(energyTickValues).tickSize(-width).tickFormat(""));

	// Draw the labelled x-axis at the bottom of the plot.
	plot.append("g")
		.attr("class", "axis axis-x")
		.attr("transform", `translate(0,${height})`)
		.call(d3.axisBottom(x).tickValues(d3.range(2, 9)).tickFormat((value) => `${value}`));
	// Draw the labelled y-axis on the left of the plot.
	plot.append("g")
		.attr("class", "axis axis-y")
		.call(d3.axisLeft(y).tickValues(energyTickValues).tickFormat((value) => `${value}`));

	// Add the label that explains the horizontal axis.
	plot.append("text")
		.attr("class", "axis-label")
		.attr("x", width / 2)
		.attr("y", height + 50)
		.attr("text-anchor", "middle")
		.text("Energy star rating (energy efficiency)");
	// Add the label that explains the vertical axis.
	plot.append("text")
		.attr("class", "axis-label")
		.attr("transform", "rotate(-90)")
		.attr("x", -height / 2)
		.attr("y", -52)
		.attr("text-anchor", "middle")
		.text("Annual energy consumption (kWh / year)");

	// Create one tooltip shared by all points in the chart.
	const tooltip = d3.select("body").append("div").attr("class", "tooltip");

	// Create one circle for each television model in the dataset.
	plot.selectAll(".point")
		.data(data)
		.join("circle")
		.attr("class", "point")
		.attr("cx", (row) => x(row.starRating))
		.attr("cy", (row) => y(row.energyConsumption))
		.attr("r", 5)
		.on("mouseenter", function (event, row) {
			// Enlarge the selected point and show its model details.
			d3.select(this).classed("point-active", true).attr("r", 8);
			tooltip
				.style("opacity", 1)
				.html(`<strong>${row.brand}</strong><span>${row.screenTech} · ${row.screenSize}-inch</span><span>${row.energyConsumption} kWh/year · ${row.starRating} stars</span>`)
				.style("left", `${event.pageX + 14}px`)
				.style("top", `${event.pageY - 18}px`);
		})
		// Keep the tooltip beside the pointer while it moves.
		.on("mousemove", (event) => tooltip.style("left", `${event.pageX + 14}px`).style("top", `${event.pageY - 18}px`))
		.on("mouseleave", function () {
			// Restore the point and hide the tooltip when the pointer leaves.
			d3.select(this).classed("point-active", false).attr("r", 5);
			tooltip.style("opacity", 0);
		});
}

// Load the energy data, draw the chart, and remove the loading message.
loadEnergyData()
	.then((data) => {
		drawScatterPlot(data);
		chartStatus.remove();
	})
	.catch((error) => {
		// Tell the user when the page cannot access the CSV file.
		chartStatus.textContent = "The dataset could not be loaded. Open this page through a local web server.";
		// Log the technical error for debugging in the browser console.
		console.error(error);
	});
