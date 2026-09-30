const donutElement = document.querySelector("#donut-chart");
const donutStatus = document.querySelector("#donut-status");
const donutColors = ["#287d78", "#e36b43", "#d4a72c"];

function drawDonutChart(data) {
	const chartWidth = Math.max(donutElement.clientWidth, 280);
	const chartHeight = Math.min(430, Math.max(320, chartWidth * 0.78));
	const radius = Math.min(chartWidth, chartHeight) * 0.34;
	const centerX = chartWidth / 2;
	const centerY = chartHeight / 2;
	const total = d3.sum(data, (row) => row.energyConsumption);

	const svg = d3.select(donutElement)
		.append("svg")
		.attr("viewBox", `0 0 ${chartWidth} ${chartHeight}`)
		.attr("role", "presentation");

	const chart = svg.append("g").attr("transform", `translate(${centerX},${centerY})`);
	const pie = d3.pie().sort(null).value((row) => row.energyConsumption);
	const arc = d3.arc().innerRadius(radius * 0.62).outerRadius(radius);
	const hoverArc = d3.arc().innerRadius(radius * 0.62).outerRadius(radius * 1.07);

	chart.selectAll(".donut-slice")
		.data(pie(data))
		.join("path")
		.attr("class", "donut-slice")
		.attr("d", arc)
		.attr("fill", (row, index) => donutColors[index % donutColors.length])
		.on("mouseenter", function (event, row) {
			d3.select(this).attr("d", hoverArc);
			d3.select("#donut-label").text(`${row.data.energyConsumption.toFixed(0)} kWh/year`);
			d3.select("#donut-sub-label").text(`${row.data.screenTech} average`);
		})
		.on("mouseleave", function () {
			d3.select(this).attr("d", arc);
			d3.select("#donut-label").text(`${total.toFixed(0)} kWh/year`);
			d3.select("#donut-sub-label").text("combined average");
		});

	chart.append("text").attr("id", "donut-label").attr("class", "donut-label").attr("text-anchor", "middle").attr("dy", "-2px").text(`${total.toFixed(0)} kWh/year`);
	chart.append("text").attr("id", "donut-sub-label").attr("class", "donut-sub-label").attr("text-anchor", "middle").attr("dy", "18px").text("combined average");

	const legend = d3.select("#donut-legend");
	legend.selectAll(".donut-legend-item")
		.data(data)
		.join("div")
		.attr("class", "donut-legend-item")
		.html((row, index) => `<span class="donut-legend-swatch" style="background:${donutColors[index % donutColors.length]}"></span><span>${row.screenTech}</span><strong>${row.energyConsumption.toFixed(0)}</strong>`);
}

loadScreenTechEnergyData()
	.then((data) => {
		drawDonutChart(data);
		donutStatus.remove();
	})
	.catch((error) => {
		donutStatus.textContent = "The screen technology data could not be loaded. Open this page through a local web server.";
		console.error(error);
	});
