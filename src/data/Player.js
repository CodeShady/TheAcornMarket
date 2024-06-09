import { Locations } from "./Database";
import { getNextFriday } from "../utils/Utils";

export const tmpPlayerData = {
	// name: "Finn", // Player's chosen name
	// level: 1, // Player's current level
	inventory: [],
	inventoryExpiration: getNextFriday(),
	coins: 0, // Amount of the game's currency the player has
	location: Locations[0]
	// TODO: Automatically update player localstorage data for new updates
};

// Change Player Data
export function getPlayerData() {
	// savePlayerData(tmpPlayerData);

	// Function to load player data from localstorage
	const storedPlayerData = localStorage.getItem("playerData");

	if (storedPlayerData) {
		return JSON.parse(storedPlayerData);
	} else {
		return tmpPlayerData;
	}
}

export function savePlayerData(newPlayerData) {
	// Function to save player data into localstorage
	console.log("Stored player data in memory", newPlayerData);
	localStorage.setItem("playerData", JSON.stringify(newPlayerData));
}

export function PlayerBalanceContainer({ balance }) {
	return (
		<div className="money-container">
			<img style={{ height: 20, marginBottom: -2 }} className="icon" src="./images/icons/coin-black.svg" alt="coin" />
			<span>{balance}</span>
		</div>
	);
}

// Function to check if cleanup is needed
export function checkPlayerItemsCleanup(expirationTimestamp, setPlayerData) {
	// Check if the user has passed their item expiration date
	const today = new Date();
	const expiration = new Date(expirationTimestamp);

	if (today > expiration) {
		// Expiration is due! Clear the items & set the new expiration date
		setPlayerData((playerData) => ({...playerData, inventory: [], inventoryExpiration: getNextFriday()}));
	}
}
