import { allFishableItems, FishableItemsCommon, FishableItemsUncommon, FishableItemsRare, FishableItemsEpic, FishableItemsLegendary } from "./FishableItems";

import seedrandom from 'seedrandom';

export const Locations = [
    {
        name: "Northwind Bay",
        description: "A vibrant coral reef teeming with colorful fish and rare treasures.",
        fish: ["Clownfish", "Angelfish", "Butterflyfish", "Lionfish"], // Example fish species
        treasures: ["Pearl Oyster", "Sea Horse Sconce", "Coral Fragment"], // Example sea treasures
    },
    {
        name: "Sunken Reef",
        description: "A vibrant coral reef teeming with colorful fish and rare treasures.",
        fish: ["Clownfish", "Angelfish", "Butterflyfish", "Lionfish"], // Example fish species
        treasures: ["Pearl Oyster", "Sea Horse Sconce", "Coral Fragment"], // Example sea treasures
    },
    {
        name: "Kelp Forest",
        description: "A mysterious underwater forest with giant kelp swaying in the current. Home to elusive creatures.",
        fish: ["Seahorse", "Cuttlefish", "Giant Kelp Fish", "Eel"],
        treasures: ["Seahorse Necklace", "Sunken Chest", "Glowing Kelp Bulb"],
    },
    {
        name: "Shipwreck Graveyard",
        description: "A spooky underwater graveyard of sunken ships. Holds hidden dangers and valuable treasures.",
        fish: ["Anglerfish", "Barracuda", "Ghost Shrimp", "Giant Squid"],
        treasures: ["Captain's Compass", "Lost Doubloon", "Broken Pirate Hat"],
    },
    {
        name: "Open Ocean",
        description: "The vast expanse of the open sea, filled with schools of fish and hidden wonders.",
        fish: ["Tuna", "Mahi-Mahi", "Swordfish", "Marlin"],
        treasures: ["Driftwood Chest", "Dolphins' Pearl", "Message in a Bottle"],
    },
    {
        name: "Hydrothermal Vent",
        description: "A volcanic underwater vent with unique lifeforms and strange treasures.",
        fish: ["Anglerfish", "Giant Tube Worm", "Yeti Crab", "Blind Cavefish"],
        treasures: ["Volcanic Glass Shard", "Heat-Resistant Coral", "Deep Sea Crystal"],
    },
];

export function getFishableItemById(id) {
    // console.log("Searching for fishable item with id", id);
    // Loop through fishable items and return the item if it matches the ID
    return allFishableItems.find((fishable) => fishable.id === id);
}

// Function to test market price for different items
export function testMarketPrice() {
    // Generate market price for each item
    allFishableItems.forEach(item => {
        getMarketBuyPrice(item.id, true);
    });
};

export function getMarketSellPrice(buyPrice) {
    // Calculate a margin for selling price relative to buy price
    const sellMargin = 0.9; // Example: sell at 90% of the buy price
    const finalPrice = Math.floor(buyPrice * sellMargin);

    // Calculate the sell price
    return finalPrice > 1 ? finalPrice : 1;
}

export function getMarketBuyPrice(id, consoleLog = false, today = new Date()) {
    // Get current date
    const currentDate = today.toISOString().slice(0, 10); // Format: YYYY-MM-DD
    const marketItem = getFishableItemById(id);

    if (!marketItem) {
        alert("ERROR MARKET ITEM");
        return;
    }

    // Check if marketItem.price is invalid
    if (!marketItem.price || !Array.isArray(marketItem.price)) {
        // Return -1 if price is not defined or not in the expected format
        return -1;
    }

    // If marketPrice.price is only a list of one price, return that price
    if (marketItem.price.length === 1) {
        return marketItem.price[0];
    }

    // Combine identifier and date
    const seed = "fishwithhats" + id + currentDate;

    // Create a seeded random number generator
    const rng = seedrandom(seed);

    // Generate price based on random price between the min price and the max price
    const minPrice = marketItem.price[0];
    const maxPrice = marketItem.price[1];
    const randomValue = rng(); // Random number between 0 and 1
    const finalPrice = Math.floor(minPrice + (maxPrice - minPrice) * randomValue);

    if (consoleLog) {
        const formattedOutput = {
            "Epoch Date": today,
            "Human Date": currentDate,
            "Seed": seed,
            "Item Name": marketItem.name.padEnd(20), // Pad item name to 20 characters
            "Buy Price": `${finalPrice} coins`, // Format price with 2 decimal places
            "Sell Price": `${getMarketSellPrice(finalPrice)} coins`, // Format price with 2 decimal places
        };

        console.table(formattedOutput);
    }

    return finalPrice > 0 ? finalPrice : marketItem.basePrice;
}

// NEW NEW NEW NEW

// Function to choose index based on weights
function chooseWeightedIndex(weights) {
    const totalWeight = weights.reduce((acc, curr) => acc + curr, 0);
    const randomNumber = Math.random() * totalWeight;
    let cumulativeWeight = 0;
    for (let i = 0; i < weights.length; i++) {
        cumulativeWeight += weights[i];
        if (randomNumber <= cumulativeWeight) {
            return i;
        }
    }
}

// Function to get a random item based on rarity
export function getRandomFishableItem() {
    const allItems = [FishableItemsCommon, FishableItemsUncommon, FishableItemsRare, FishableItemsEpic, FishableItemsLegendary];
    const rarityWeights = [5, 3, 1.8, 0.8, 0.2]; // Adjust weights as needed to make Legendary items rarer

    // Choose a rarity based on weights
    const rarityIndex = chooseWeightedIndex(rarityWeights);

    // Choose a random item from the selected rarity
    const itemsOfSelectedRarity = allItems[rarityIndex];
    const randomIndex = Math.floor(Math.random() * itemsOfSelectedRarity.length);
    return itemsOfSelectedRarity[randomIndex];
}
