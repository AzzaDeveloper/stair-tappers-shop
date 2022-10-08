const PORT = 3000;
const fs = require("fs");
var colors = require('colors');
//

const express = require("express");
const app = express();
// Shops content
var shop = {
	nextStock: Math.floor(Date.now() / 1000) + 20,
	cycle: 10,
	stockAmount: {
		Legendary: 1,
		Epic: 1,
		Rare: 1,
		Common: 2
	}
}
var stock = {
	cubes: {},
	platforms: {},
};
var currentStock = {
	cubes: {},
	platforms: {},
};
// Process stocks on first run
Object.entries(JSON.parse(fs.readFileSync("cubes.json"))).forEach(cube => {
	cube = cube[1];
	// Sort to the correct rarities
	if (!(cube.rarity in stock.cubes)) {stock.cubes[cube.rarity] = []; currentStock.cubes[cube.rarity] = []};
	stock.cubes[cube.rarity].push(cube);
})
Object.entries(JSON.parse(fs.readFileSync("platforms.json"))).forEach(platform => {
	platform = platform[1];
	// Sort to the correct rarities
	if (!(platform.rarity in stock.platforms)) {stock.platforms[platform.rarity] = []; currentStock.platforms[platform.rarity] = []};
	stock.platforms[platform.rarity].push(platform);
})
// Schedule the stock
// Shop refreshing
const { ToadScheduler, SimpleIntervalJob, Task } = require('toad-scheduler')

const scheduler = new ToadScheduler()

const task = new Task('refresh', () => {generate()})
const job = new SimpleIntervalJob({seconds: shop.cycle}, task)

scheduler.addSimpleIntervalJob(job);
// Generate the stock
function generate() {
	scheduler.stop();
	console.log("Stock generated.".magenta)
	for (itemType in stock) {
		for (rarity in stock[itemType]) {
			// Reset the stock
			currentStock[itemType][rarity] = [];
			// Randomly select things to go in stock
			var pool = structuredClone(stock[itemType][rarity]);
			for (i = 0; i < shop.stockAmount[rarity]; i++) {
				var index = Math.floor(Math.random() * pool.length)
				var item = pool[index];
				// remove that item from the pool so it wont roll again
				pool.splice(index, 1);
				currentStock[itemType][rarity].push(item);
			}
		}
	}
	// Update stock timer
	shop.nextStock = Math.floor(Date.now() / 1000) + shop.cycle;
	scheduler.addSimpleIntervalJob(job);
	clear();
}
generate();
// Listen for shop content requests
app.get("/get", (req, res) => {
	res.send({stock: currentStock, nextRestock: shop.nextStock});
})

// Listening
app.listen(PORT, () => {
	//   
});

// Console 
function clear() {
	console.clear();
	console.log("   _____ __  ______  ____ ".red);
	console.log("  / ___// / / / __ \\/ __ \\".red);
	console.log("  \\__ \\/ /_/ / / / / /_/ /".red);
	console.log(" ___/ / __  / /_/ / ____/ ".red);
	console.log("/____/_/ /_/\\____/_/      ".red);
	console.log("\n");
	console.log("Current stock: ".black.bgWhite);
	// Cube stock
	var cubestock = "Cubes: ";
	for (rarity in currentStock.cubes) {
		currentStock.cubes[rarity].forEach(item => {
			var name = item.name + " ";
			if (rarity == "Legendary") name = name.red;
			if (rarity == "Epic") name = name.magenta;
			if (rarity == "Rare") name = name.blue;
			cubestock += name;
		})
	}
	console.log(cubestock);
	// Platforms stock
	var platformstock = "Platforms: ";
	for (rarity in currentStock.platforms) {
		currentStock.platforms[rarity].forEach(item => {
			var name = item.name + " ";
			if (rarity == "Legendary") name = name.red;
			if (rarity == "Epic") name = name.magenta;
			if (rarity == "Rare") name = name.blue;
			platformstock += name;
		})
	}
	console.log(platformstock);
	console.log("Stock refresh: ".black.bgWhite + (shop.cycle + " seconds / " + (shop.cycle / 3600).toFixed(1) + " hours").green.bgBlack);
	console.log("Available options:".black.bgWhite + " restock".green.bgBlack + " stock-amount".green.bgBlack);

}

const readline = require('readline');
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});
//
clear();
rl.on('line', function (input) {
	if (input == "restock") {
		clear();
		generate();
	} else if (input == "stock-amount") {
		clear();;
		console.log("Current stock amount: ");
		for (rarity in shop.stockAmount) {
			console.log(rarity.yellow + ": " + shop.stockAmount[rarity]);
		}
	}
})
