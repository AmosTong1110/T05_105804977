const chartElement = document.querySelector("#chart");
const chartStatus = document.querySelector("#chart-status");

function drawScatterPlot(data) {
	const margin = { top: 20, right: 30, bottom: 64, left: 72 };
	const chartWidth = Math.max(chartElement.clientWidth, 320);
	const chartHeight = Math.min(560, Math.max(390, chartWidth * 0.58));
	const width = chartWidth - margin.left - margin.right;
	const height = chartHeight - margin.top - margin.bottom;
	const maxEnergy = d3.max(data, (row) => row.energyConsumption);
	const energyTickValues = d3.range(0, Math.ceil(maxEnergy / 200) * 200 + 1, 200);

	const svg = d3.select(chartElement)
		.append("svg")
		.attr("viewBox", `0 0 ${chartWidth} ${chartHeight}`)
		.attr("role", "presentation");

	const x = d3.scaleLinear()
		.domain([d3.min(data, (row) => row.starRating) - 0.5, d3.max(data, (row) => row.starRating) + 0.5])
		.range([0, width]);
	const y = d3.scaleLinear()
		.domain([0, maxEnergy * 1.05])
		.range([height, 0]);

	const plot = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

	plot.append("g")
		.attr("class", "grid grid-x")
		.attr("transform", `translate(0,${height})`)
		.call(d3.axisBottom(x).tickValues(d3.range(2, 9)).tickSize(-height).tickFormat(""));
	plot.append("g")
		.attr("class", "grid grid-y")
		.call(d3.axisLeft(y).tickValues(energyTickValues).tickSize(-width).tickFormat(""));

	plot.append("g")
		.attr("class", "axis axis-x")
		.attr("transform", `translate(0,${height})`)
		.call(d3.axisBottom(x).tickValues(d3.range(2, 9)).tickFormat((value) => `${value}`));
	plot.append("g")
		.attr("class", "axis axis-y")
		.call(d3.axisLeft(y).tickValues(energyTickValues).tickFormat((value) => `${value}`));

	plot.append("text")
		.attr("class", "axis-label")
		.attr("x", width / 2)
		.attr("y", height + 50)
		.attr("text-anchor", "middle")
		.text("Energy star rating (energy efficiency)");
	plot.append("text")
		.attr("class", "axis-label")
		.attr("transform", "rotate(-90)")
		.attr("x", -height / 2)
		.attr("y", -52)
		.attr("text-anchor", "middle")
		.text("Annual energy consumption (kWh / year)");

	const tooltip = d3.select("body").append("div").attr("class", "tooltip");

	plot.selectAll(".point")
		.data(data)
		.join("circle")
		.attr("class", "point")
		.attr("cx", (row) => x(row.starRating))
		.attr("cy", (row) => y(row.energyConsumption))
		.attr("r", 5)
		.on("mouseenter", function (event, row) {
			d3.select(this).classed("point-active", true).attr("r", 8);
			tooltip
				.style("opacity", 1)
				.html(`<strong>${row.brand}</strong><span>${row.screenTech} · ${row.screenSize}-inch</span><span>${row.energyConsumption} kWh/year · ${row.starRating} stars</span>`)
				.style("left", `${event.pageX + 14}px`)
				.style("top", `${event.pageY - 18}px`);
		})
		.on("mousemove", (event) => tooltip.style("left", `${event.pageX + 14}px`).style("top", `${event.pageY - 18}px`))
		.on("mouseleave", function () {
			d3.select(this).classed("point-active", false).attr("r", 5);
			tooltip.style("opacity", 0);
		});
}

loadEnergyData()
	.then((data) => {
		drawScatterPlot(data);
		chartStatus.remove();
	})
	.catch((error) => {
		chartStatus.textContent = "The dataset could not be loaded. Open this page through a local web server.";
		console.error(error);
	});
