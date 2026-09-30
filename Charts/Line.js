const lineChartElement = document.querySelector("#line-chart");
const lineChartStatus = document.querySelector("#line-chart-status");

function drawLineChart(data) {
	const margin = { top: 24, right: 28, bottom: 64, left: 72 };
	const chartWidth = Math.max(lineChartElement.clientWidth, 320);
	const chartHeight = Math.min(500, Math.max(360, chartWidth * 0.52));
	const width = chartWidth - margin.left - margin.right;
	const height = chartHeight - margin.top - margin.bottom;
	const minPrice = d3.min(data, (row) => row.averagePrice);
	const maxPrice = d3.max(data, (row) => row.averagePrice);

	const svg = d3.select(lineChartElement)
		.append("svg")
		.attr("viewBox", `0 0 ${chartWidth} ${chartHeight}`)
		.attr("role", "presentation");

	const x = d3.scaleLinear()
		.domain(d3.extent(data, (row) => row.year))
		.range([0, width]);
	const y = d3.scaleLinear()
		.domain([Math.max(0, minPrice - 10), maxPrice + 20])
		.nice()
		.range([height, 0]);
	const xTicks = d3.range(1998, 2025, 4);
	const plot = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

	plot.append("g")
		.attr("class", "grid grid-y")
		.call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(""));
	plot.append("g")
		.attr("class", "axis axis-x")
		.attr("transform", `translate(0,${height})`)
		.call(d3.axisBottom(x).tickValues(xTicks).tickFormat(d3.format("d")));
	plot.append("g")
		.attr("class", "axis axis-y")
		.call(d3.axisLeft(y).ticks(5).tickFormat((value) => `$${value}`));

	plot.append("text")
		.attr("class", "axis-label")
		.attr("x", width / 2)
		.attr("y", height + 50)
		.attr("text-anchor", "middle")
		.text("Year");
	plot.append("text")
		.attr("class", "axis-label")
		.attr("transform", "rotate(-90)")
		.attr("x", -height / 2)
		.attr("y", -52)
		.attr("text-anchor", "middle")
		.text("Average spot price ($ / MWh)");

	const line = d3.line()
		.x((row) => x(row.year))
		.y((row) => y(row.averagePrice));

	plot.append("path")
		.datum(data)
		.attr("class", "price-line")
		.attr("d", line);

	const tooltip = d3.select("body").append("div").attr("class", "tooltip");
	plot.selectAll(".price-point")
		.data(data)
		.join("circle")
		.attr("class", "price-point")
		.attr("cx", (row) => x(row.year))
		.attr("cy", (row) => y(row.averagePrice))
		.attr("r", 4)
		.on("mouseenter", function (event, row) {
			d3.select(this).classed("price-point-active", true).attr("r", 7);
			tooltip
				.style("opacity", 1)
				.html(`<strong>${row.year}</strong><span>$${row.averagePrice.toFixed(2)} / MWh average</span>`)
				.style("left", `${event.pageX + 14}px`)
				.style("top", `${event.pageY - 18}px`);
		})
		.on("mousemove", (event) => tooltip.style("left", `${event.pageX + 14}px`).style("top", `${event.pageY - 18}px`))
		.on("mouseleave", function () {
			d3.select(this).classed("price-point-active", false).attr("r", 4);
			tooltip.style("opacity", 0);
		});
}

loadSpotPriceData()
	.then((data) => {
		drawLineChart(data);
		lineChartStatus.remove();
	})
	.catch((error) => {
		lineChartStatus.textContent = "The spot-price dataset could not be loaded. Open this page through a local web server.";
		console.error(error);
	});
