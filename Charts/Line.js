// Find the container where the line chart will be drawn.
const lineChartElement = document.querySelector("#line-chart");
// Find the loading message for the line chart.
const lineChartStatus = document.querySelector("#line-chart-status");

function drawLineChart(data) {
	// Reserve space around the chart for labels and axes.
	const margin = { top: 24, right: 28, bottom: 64, left: 72 };
	// Keep the chart wide enough to display the year labels.
	const chartWidth = Math.max(lineChartElement.clientWidth, 320);
	// Keep the chart height within a readable range.
	const chartHeight = Math.min(500, Math.max(360, chartWidth * 0.52));
	// Calculate the drawable area inside the margins.
	const width = chartWidth - margin.left - margin.right;
	const height = chartHeight - margin.top - margin.bottom;
	// Find the smallest and largest prices for the y-axis domain.
	const minPrice = d3.min(data, (row) => row.averagePrice);
	const maxPrice = d3.max(data, (row) => row.averagePrice);

	// Create the responsive SVG drawing area.
	const svg = d3.select(lineChartElement)
		.append("svg")
		.attr("viewBox", `0 0 ${chartWidth} ${chartHeight}`)
		.attr("role", "presentation");

	// Convert years into horizontal positions.
	const x = d3.scaleLinear()
		.domain(d3.extent(data, (row) => row.year))
		.range([0, width]);
	// Convert prices into vertical positions and choose rounded tick values.
	const y = d3.scaleLinear()
		.domain([Math.max(0, minPrice - 10), maxPrice + 20])
		.nice()
		.range([height, 0]);
	// Show every fourth year to keep the x-axis readable.
	const xTicks = d3.range(1998, 2025, 4);
	// Group the plot elements and apply the chart margins.
	const plot = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

	// Draw horizontal guide lines across the chart.
	plot.append("g")
		.attr("class", "grid grid-y")
		.call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(""));
	// Draw the labelled year axis at the bottom.
	plot.append("g")
		.attr("class", "axis axis-x")
		.attr("transform", `translate(0,${height})`)
		.call(d3.axisBottom(x).tickValues(xTicks).tickFormat(d3.format("d")));
	// Draw the labelled price axis on the left.
	plot.append("g")
		.attr("class", "axis axis-y")
		.call(d3.axisLeft(y).ticks(5).tickFormat((value) => `$${value}`));

	// Label the horizontal axis.
	plot.append("text")
		.attr("class", "axis-label")
		.attr("x", width / 2)
		.attr("y", height + 50)
		.attr("text-anchor", "middle")
		.text("Year");
	// Label the vertical axis.
	plot.append("text")
		.attr("class", "axis-label")
		.attr("transform", "rotate(-90)")
		.attr("x", -height / 2)
		.attr("y", -52)
		.attr("text-anchor", "middle")
		.text("Average spot price ($ / MWh)");

	// Convert the price records into a connected line path.
	const line = d3.line()
		.x((row) => x(row.year))
		.y((row) => y(row.averagePrice));

	// Draw the line using all yearly price records.
	plot.append("path")
		.datum(data)
		.attr("class", "price-line")
		.attr("d", line);

	// Create one tooltip shared by all yearly points.
	const tooltip = d3.select("body").append("div").attr("class", "tooltip");
	// Add a point at each year so users can inspect its exact value.
	plot.selectAll(".price-point")
		.data(data)
		.join("circle")
		.attr("class", "price-point")
		.attr("cx", (row) => x(row.year))
		.attr("cy", (row) => y(row.averagePrice))
		.attr("r", 4)
		.on("mouseenter", function (event, row) {
			// Enlarge the selected point and show its average price.
			d3.select(this).classed("price-point-active", true).attr("r", 7);
			tooltip
				.style("opacity", 1)
				.html(`<strong>${row.year}</strong><span>$${row.averagePrice.toFixed(2)} / MWh average</span>`)
				.style("left", `${event.pageX + 14}px`)
				.style("top", `${event.pageY - 18}px`);
		})
		// Keep the tooltip beside the pointer while it moves.
		.on("mousemove", (event) => tooltip.style("left", `${event.pageX + 14}px`).style("top", `${event.pageY - 18}px`))
		.on("mouseleave", function () {
			// Restore the point and hide the tooltip when the pointer leaves.
			d3.select(this).classed("price-point-active", false).attr("r", 4);
			tooltip.style("opacity", 0);
		});
}

// Load the spot-price data, draw the chart, and remove the loading message.
loadSpotPriceData()
	.then((data) => {
		drawLineChart(data);
		lineChartStatus.remove();
	})
	.catch((error) => {
		// Show a helpful message when the CSV cannot be loaded.
		lineChartStatus.textContent = "The spot-price dataset could not be loaded. Open this page through a local web server.";
		// Log the technical error for debugging.
		console.error(error);
	});
