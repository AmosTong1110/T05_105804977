// Store the path to the full television energy dataset.
const ENERGY_DATA_PATH = "Ex5_Data/Ex5_TV_energy.csv";
// Store the path to the all-size screen technology dataset.
const SCREEN_TECH_ENERGY_DATA_PATH = "Ex5_Data/Ex5_TV_energy_Allsizes_byScreenType.csv";
// Store the path to the 55-inch screen technology dataset.
const SCREEN_TECH_55_ENERGY_DATA_PATH = "Ex5_Data/Ex5_TV_energy_55inchtv_byScreenType.csv";
// Store the path to the Australian spot-price dataset.
const SPOT_PRICE_DATA_PATH = "Ex5_Data/Ex5_ARE_Spot_Prices.csv";

async function loadSpotPriceData() {
	// Read the CSV and convert its useful columns from text into numbers.
	const rows = await d3.csv(SPOT_PRICE_DATA_PATH, (row) => ({
		year: Number(row.Year),
		averagePrice: Number(row["Average Price (notTas-Snowy)"])
	}));

	// Keep only rows with valid year and price values.
	return rows.filter((row) => Number.isFinite(row.year) && Number.isFinite(row.averagePrice));
}

async function loadEnergyData() {
	// Read the CSV and give its columns clearer JavaScript property names.
	const rows = await d3.csv(ENERGY_DATA_PATH, (row) => ({
		brand: row.brand,
		screenTech: row.screen_tech,
		screenSize: Number(row.screensize),
		energyConsumption: Number(row.energy_consumpt),
		starRating: Number(row.star2),
		count: Number(row.count)
	}));

	// Keep only rows that can be plotted on the scatter plot.
	return rows.filter((row) => Number.isFinite(row.energyConsumption) && Number.isFinite(row.starRating));
}

async function loadScreenTechEnergyData() {
	// Read average energy use for each screen technology across all sizes.
	const rows = await d3.csv(SCREEN_TECH_ENERGY_DATA_PATH, (row) => ({
		screenTech: row.Screen_Tech,
		energyConsumption: Number(row["Mean(Labelled energy consumption (kWh/year))"])
	}));

	// Remove rows without a technology name or valid energy value.
	return rows.filter((row) => row.screenTech && Number.isFinite(row.energyConsumption));
}

async function load55InchScreenTechEnergyData() {
	// Read average energy use for each screen technology at 55 inches.
	const rows = await d3.csv(SCREEN_TECH_55_ENERGY_DATA_PATH, (row) => ({
		screenTech: row.Screen_Tech,
		energyConsumption: Number(row["Mean(Labelled energy consumption (kWh/year))"])
	}));

	// Remove rows without a technology name or valid energy value.
	return rows.filter((row) => row.screenTech && Number.isFinite(row.energyConsumption));
}
