const ENERGY_DATA_PATH = "Ex5_Data/Ex5_TV_energy.csv";
const SCREEN_TECH_ENERGY_DATA_PATH = "Ex5_Data/Ex5_TV_energy_Allsizes_byScreenType.csv";
const SCREEN_TECH_55_ENERGY_DATA_PATH = "Ex5_Data/Ex5_TV_energy_55inchtv_byScreenType.csv";
const SPOT_PRICE_DATA_PATH = "Ex5_Data/Ex5_ARE_Spot_Prices.csv";

async function loadSpotPriceData() {
	const rows = await d3.csv(SPOT_PRICE_DATA_PATH, (row) => ({
		year: Number(row.Year),
		averagePrice: Number(row["Average Price (notTas-Snowy)"])
	}));

	return rows.filter((row) => Number.isFinite(row.year) && Number.isFinite(row.averagePrice));
}

async function loadEnergyData() {
	const rows = await d3.csv(ENERGY_DATA_PATH, (row) => ({
		brand: row.brand,
		screenTech: row.screen_tech,
		screenSize: Number(row.screensize),
		energyConsumption: Number(row.energy_consumpt),
		starRating: Number(row.star2),
		count: Number(row.count)
	}));

	return rows.filter((row) => Number.isFinite(row.energyConsumption) && Number.isFinite(row.starRating));
}

async function loadScreenTechEnergyData() {
	const rows = await d3.csv(SCREEN_TECH_ENERGY_DATA_PATH, (row) => ({
		screenTech: row.Screen_Tech,
		energyConsumption: Number(row["Mean(Labelled energy consumption (kWh/year))"])
	}));

	return rows.filter((row) => row.screenTech && Number.isFinite(row.energyConsumption));
}

async function load55InchScreenTechEnergyData() {
	const rows = await d3.csv(SCREEN_TECH_55_ENERGY_DATA_PATH, (row) => ({
		screenTech: row.Screen_Tech,
		energyConsumption: Number(row["Mean(Labelled energy consumption (kWh/year))"])
	}));

	return rows.filter((row) => row.screenTech && Number.isFinite(row.energyConsumption));
}
