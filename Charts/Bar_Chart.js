const barChartElement = document.querySelector("#bar-chart");
const barChartStatus = document.querySelector("#bar-chart-status");
const barColors = ["#287d78", "#e36b43", "#d4a72c"];

function drawBarChart(data) {
	const margin = { top: 24, right: 24, bottom: 58, left: 72 };
	const chartWidth = Math.max(barChartElement.clientWidth, 320);
	const chartHeight = Math.min(480, Math.max(350, chartWidth * 0.58));
	const width = chartWidth - margin.left - margin.right;
	const height = chartHeight - margin.top - margin.bottom;
	const maxEnergy = d3.max(data, (row) => row.energyConsumption);
	const energyTickValues = d3.range(0, Math.ceil(maxEnergy / 100) * 100 + 1, 100);

	const svg = d3.select(barChartElement)
		.append("svg")
		.attr("viewBox", `0 0 ${chartWidth} ${chartHeight}`)
		.attr("role", "presentation");

	const x = d3.scaleBand()
		.domain(data.map((row) => row.screenTech))
		.range([0, width])
		.padding(0.34);
	const y = d3.scaleLinear()
		.domain([0, maxEnergy * 1.12])
		.nice()
		.range([height, 0]);
	const plot = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

	plot.append("g")
		.attr("class", "grid grid-y")
		.call(d3.axisLeft(y).tickValues(energyTickValues).tickSize(-width).tickFormat(""));
	plot.append("g")
		.attr("class", "axis axis-x")
		.attr("transform", `translate(0,${height})`)
		.call(d3.axisBottom(x));
	plot.append("g")
		.attr("class", "axis axis-y")
		.call(d3.axisLeft(y).tickValues(energyTickValues).tickFormat((value) => `${value}`));

	plot.append("text")
		.attr("class", "axis-label")
		.attr("x", width / 2)
		.attr("y", height + 48)
		.attr("text-anchor", "middle")
		.text("Screen technology");
	plot.append("text")
		.attr("class", "axis-label")
		.attr("transform", "rotate(-90)")
		.attr("x", -height / 2)
		.attr("y", -52)
		.attr("text-anchor", "middle")
		.text("Annual energy consumption (kWh / year)");

	const tooltip = d3.select("body").append("div").attr("class", "tooltip");
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
			d3.select(this).classed("bar-active", true);
			tooltip
				.style("opacity", 1)
				.html(`<strong>${row.screenTech}</strong><span>55-inch average</span><span>${row.energyConsumption.toFixed(0)} kWh/year</span>`)
				.style("left", `${event.pageX + 14}px`)
				.style("top", `${event.pageY - 18}px`);
		})
		.on("mousemove", (event) => tooltip.style("left", `${event.pageX + 14}px`).style("top", `${event.pageY - 18}px`))
		.on("mouseleave", function () {
			d3.select(this).classed("bar-active", false);
			tooltip.style("opacity", 0);
		});
}

load55InchScreenTechEnergyData()
	.then((data) => {
		drawBarChart(data);
		barChartStatus.remove();
	})
	.catch((error) => {
		barChartStatus.textContent = "The 55-inch screen technology data could not be loaded. Open this page through a local web server.";
		console.error(error);
	});
